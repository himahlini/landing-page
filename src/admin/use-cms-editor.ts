import { computed, onBeforeUnmount, ref, watch, type Ref } from "vue";

import { defaultSiteContent, normalizeSiteContent, type SiteContent } from "../content/site-content";
import { ApiError, api, errorMessage, isUnauthorized, type DeployJob, type EditorPayload, type SnapshotMeta } from "./api";
import { showToast } from "./feedback";

const autosaveDelayMs = 1500;
const pollIntervalMs = 5000;

export type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

const recentSuccessMs = 10 * 60 * 1000;

const serialize = (content: SiteContent) => JSON.stringify(content);

// Only remind the user about a successful publish for a short while after it finished.
const isStaleSuccess = (job: DeployJob | null) =>
  job?.status === "success" && Date.now() - new Date(job.completed_at ?? job.created_at).getTime() > recentSuccessMs;

export const useCmsEditor = (onUnauthorized: () => void) => {
  const content = ref(structuredClone(defaultSiteContent)) as Ref<SiteContent>;
  const publishedContent = ref(structuredClone(defaultSiteContent)) as Ref<SiteContent>;
  const draftMeta = ref<SnapshotMeta | null>(null);
  const publishedMeta = ref<SnapshotMeta | null>(null);

  const loadState = ref<"loading" | "ready" | "error">("loading");
  const loadError = ref("");

  const savedJson = ref(serialize(content.value));
  const saveState = ref<SaveState>("idle");
  const saveError = ref("");
  const lastSavedAt = ref<Date | null>(null);

  const deployJob = ref<DeployJob | null>(null);
  const publishing = ref(false);

  let saveTimer: number | undefined;
  let pollTimer: number | undefined;
  let savePromise: Promise<void> | null = null;

  const currentJson = computed(() => serialize(content.value));
  const hasUnsavedChanges = computed(() => currentJson.value !== savedJson.value);
  const hasUnpublishedChanges = computed(() => currentJson.value !== serialize(publishedContent.value));
  const isDeploying = computed(
    () => publishing.value || deployJob.value?.status === "running" || deployJob.value?.status === "queued"
  );
  const lastDeployFailed = computed(() => deployJob.value?.status === "failed");

  const applyPayload = (payload: EditorPayload, { replaceContent }: { replaceContent: boolean }) => {
    publishedContent.value = normalizeSiteContent(payload.publishedContent);
    draftMeta.value = payload.draft;
    publishedMeta.value = payload.published;

    if (replaceContent) {
      content.value = normalizeSiteContent(payload.content);
      savedJson.value = serialize(content.value);
    }
  };

  const handleError = (error: unknown) => {
    if (isUnauthorized(error)) {
      onUnauthorized();
    }
  };

  const load = async () => {
    loadState.value = "loading";
    loadError.value = "";

    try {
      const [payload, latest] = await Promise.all([api.loadContent(), api.latestDeploy().catch(() => ({ job: null }))]);
      applyPayload(payload, { replaceContent: true });
      lastSavedAt.value = payload.draft ? new Date(payload.draft.updatedAt) : null;
      saveState.value = "idle";
      setDeployJob(isStaleSuccess(latest.job) ? null : latest.job);
      loadState.value = "ready";
    } catch (error) {
      handleError(error);
      loadError.value = errorMessage(error, "We couldn't load your website content.");
      loadState.value = "error";
    }
  };

  const saveNow = async (): Promise<void> => {
    window.clearTimeout(saveTimer);

    if (savePromise) {
      await savePromise;
    }

    if (!hasUnsavedChanges.value) {
      if (saveState.value === "pending") saveState.value = "saved";
      return;
    }

    const snapshot = currentJson.value;
    saveState.value = "saving";
    saveError.value = "";

    savePromise = (async () => {
      try {
        const payload = await api.saveDraft(JSON.parse(snapshot) as SiteContent);
        applyPayload(payload, { replaceContent: false });
        savedJson.value = snapshot;
        lastSavedAt.value = new Date();
        saveState.value = hasUnsavedChanges.value ? "pending" : "saved";
      } catch (error) {
        handleError(error);
        saveError.value = errorMessage(error, "Your changes couldn't be saved.");
        saveState.value = "error";
      } finally {
        savePromise = null;
      }
    })();

    await savePromise;

    // Edits made while the request was in flight still need saving.
    if ((saveState.value as SaveState) === "pending") {
      scheduleSave();
    }
  };

  const scheduleSave = () => {
    window.clearTimeout(saveTimer);
    saveState.value = "pending";
    saveTimer = window.setTimeout(() => void saveNow(), autosaveDelayMs);
  };

  watch(currentJson, () => {
    if (loadState.value === "ready" && hasUnsavedChanges.value && saveState.value !== "saving") {
      scheduleSave();
    }
  });

  const stopPolling = () => window.clearTimeout(pollTimer);

  const pollJob = (jobId: string) => {
    stopPolling();
    pollTimer = window.setTimeout(async () => {
      try {
        const { job } = await api.getJob(jobId);
        setDeployJob(job, { announce: true });
      } catch (error) {
        handleError(error);
        // Keep polling through brief network hiccups; the deploy itself keeps running.
        if (!isUnauthorized(error)) pollJob(jobId);
      }
    }, pollIntervalMs);
  };

  const setDeployJob = (job: DeployJob | null, { announce = false } = {}) => {
    const wasRunning = deployJob.value?.status === "running" || deployJob.value?.status === "queued";
    deployJob.value = job;

    if (!job) return;

    if (job.status === "running" || job.status === "queued") {
      pollJob(job.id);
    } else if (announce && wasRunning) {
      if (job.status === "success") {
        showToast("success", "Your changes are live", "Visitors can now see the updated website.");
      } else {
        showToast("error", "Publishing didn't finish", "Your changes are still saved. Please try again.");
      }
    }
  };

  const publish = async () => {
    window.clearTimeout(saveTimer);
    if (savePromise) await savePromise;

    publishing.value = true;
    const snapshot = currentJson.value;

    try {
      const { job } = await api.publish(JSON.parse(snapshot) as SiteContent);
      savedJson.value = snapshot;
      publishedContent.value = JSON.parse(snapshot) as SiteContent;
      lastSavedAt.value = new Date();
      saveState.value = "saved";
      setDeployJob(job);
    } catch (error) {
      handleError(error);
      const job = error instanceof ApiError ? (error.body?.job as DeployJob | undefined) : undefined;

      if (job) {
        setDeployJob(job);
      }

      if (error instanceof ApiError && error.status === 409) {
        showToast("info", "Already publishing", "Wait for the current publish to finish, then try again.");
      } else if (!isUnauthorized(error)) {
        showToast("error", "Couldn't publish", errorMessage(error));
      }
    } finally {
      publishing.value = false;
    }
  };

  const discardUnpublished = () => {
    content.value = structuredClone(publishedContent.value);
  };

  const dismissDeployResult = () => {
    if (deployJob.value && deployJob.value.status === "success") {
      deployJob.value = null;
    }
  };

  onBeforeUnmount(() => {
    window.clearTimeout(saveTimer);
    stopPolling();
  });

  return {
    content,
    publishedContent,
    draftMeta,
    publishedMeta,
    loadState,
    loadError,
    saveState,
    saveError,
    lastSavedAt,
    hasUnsavedChanges,
    hasUnpublishedChanges,
    deployJob,
    publishing,
    isDeploying,
    lastDeployFailed,
    load,
    saveNow,
    publish,
    discardUnpublished,
    dismissDeployResult
  };
};
