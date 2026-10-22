<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  LogOut,
  RefreshCw,
  Rocket,
  Undo2,
  WifiOff
} from "lucide-vue-next";

import "../admin/admin.css";
import { api, errorMessage, isUnauthorized, type AdminUser } from "../admin/api";
import AdminConfirmDialog from "../admin/components/AdminConfirmDialog.vue";
import AdminDeployStatus from "../admin/components/AdminDeployStatus.vue";
import AdminLogin from "../admin/components/AdminLogin.vue";
import AdminToastStack from "../admin/components/AdminToastStack.vue";
import { askConfirm, showToast } from "../admin/feedback";
import { adminFormKey } from "../admin/form-context";
import AboutSection from "../admin/sections/AboutSection.vue";
import ContactSection from "../admin/sections/ContactSection.vue";
import FooterSection from "../admin/sections/FooterSection.vue";
import HeroSection from "../admin/sections/HeroSection.vue";
import NavigationSection from "../admin/sections/NavigationSection.vue";
import PeopleSection from "../admin/sections/PeopleSection.vue";
import PracticeSection from "../admin/sections/PracticeSection.vue";
import SiteSection from "../admin/sections/SiteSection.vue";
import { formatRelativeTime } from "../admin/time";
import { useCmsEditor } from "../admin/use-cms-editor";
import { changedSections, errorCountBySection, sections, validateSiteContent, type SectionId } from "../admin/validation";

const sectionComponents = {
  site: SiteSection,
  hero: HeroSection,
  navigation: NavigationSection,
  practice: PracticeSection,
  about: AboutSection,
  people: PeopleSection,
  contact: ContactSection,
  footer: FooterSection
};

const user = ref<AdminUser | null>(null);
const checkingSession = ref(true);
const sessionExpired = ref(false);
const isOnline = ref(true);
const showAllErrors = ref(false);
const uploadsInFlight = ref(0);
const now = ref(new Date());
const contentTop = ref<HTMLElement | null>(null);

const initialSection = () => {
  const hash = typeof window === "undefined" ? "" : window.location.hash.slice(1);
  return sections.some((section) => section.id === hash) ? (hash as SectionId) : "site";
};
const activeSection = ref<SectionId>(initialSection());

const editor = useCmsEditor(() => {
  if (user.value) sessionExpired.value = true;
});
const { content, loadState, saveState, deployJob } = editor;

const errors = computed(() => validateSiteContent(content.value));
const errorCounts = computed(() => errorCountBySection(errors.value));
const totalErrors = computed(() => Object.keys(errors.value).length);
const unpublishedSections = computed(() => changedSections(content.value, editor.publishedContent.value));
const activeDefinition = computed(() => sections.find((section) => section.id === activeSection.value) ?? sections[0]);
const liveUrl = computed(() => deployJob.value?.deployment_url || window.location.origin);
const lastPublishedLabel = computed(() => {
  const publishedAt = editor.publishedMeta.value?.publishedAt;
  return publishedAt ? formatRelativeTime(new Date(publishedAt), now.value) : "";
});
const lastSavedLabel = computed(() =>
  editor.lastSavedAt.value ? formatRelativeTime(editor.lastSavedAt.value, now.value) : ""
);

const canPublish = computed(
  () =>
    loadState.value === "ready" &&
    !editor.isDeploying.value &&
    uploadsInFlight.value === 0 &&
    (editor.hasUnpublishedChanges.value || editor.lastDeployFailed.value)
);

const publishTitle = computed(() => {
  if (editor.isDeploying.value) return "Publishing is in progress";
  if (uploadsInFlight.value) return "Wait for the image upload to finish";
  if (!editor.hasUnpublishedChanges.value && !editor.lastDeployFailed.value) return "There are no changes to publish";
  return "Make your changes visible on the website";
});

const status = computed(() => {
  if (saveState.value === "saving" || saveState.value === "pending") {
    return { tone: "neutral", label: "Saving…" } as const;
  }
  if (saveState.value === "error") {
    return { tone: "error", label: "Changes not saved" } as const;
  }
  if (editor.isDeploying.value) {
    return { tone: "neutral", label: "Publishing…" } as const;
  }
  if (editor.lastDeployFailed.value) {
    return { tone: "error", label: "Last publish failed" } as const;
  }
  if (editor.hasUnpublishedChanges.value) {
    return { tone: "warning", label: "Saved as draft · not live yet" } as const;
  }
  return { tone: "success", label: "Everything is live" } as const;
});

provide(adminFormKey, {
  errors,
  content,
  publishedContent: editor.publishedContent,
  showAllErrors,
  uploadsInFlight,
  onUnauthorized: () => (sessionExpired.value = true)
});

const revealActiveTab = () =>
  document.querySelector('[aria-label="Website sections"] [aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });

watch(loadState, async (state) => {
  if (state === "ready") {
    await nextTick();
    revealActiveTab();
  }
});

const selectSection = async (id: SectionId) => {
  activeSection.value = id;
  window.history.replaceState(null, "", `#${id}`);
  await nextTick();
  revealActiveTab();
  if (contentTop.value && contentTop.value.getBoundingClientRect().top < 0) {
    contentTop.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const startEditor = async (signedInUser: AdminUser) => {
  user.value = signedInUser;
  await editor.load();
};

const checkSession = async () => {
  checkingSession.value = true;
  try {
    const { user: sessionUser } = await api.me();
    await startEditor(sessionUser);
  } catch (error) {
    if (!isUnauthorized(error)) {
      showToast("error", "Couldn't reach the editor", errorMessage(error));
    }
    user.value = null;
  } finally {
    checkingSession.value = false;
  }
};

const onReauthenticated = async (signedInUser: AdminUser) => {
  user.value = signedInUser;
  sessionExpired.value = false;
  showToast("success", "Signed in again", "Your edits were kept.");

  if (loadState.value !== "ready") {
    await editor.load();
  } else if (editor.hasUnsavedChanges.value) {
    await editor.saveNow();
  }
};

const signOut = async () => {
  if (editor.hasUnsavedChanges.value) {
    await editor.saveNow();
  }

  if (editor.hasUnsavedChanges.value) {
    const confirmed = await askConfirm({
      title: "Sign out without saving?",
      body: "Some of your latest edits couldn't be saved and will be lost.",
      confirmLabel: "Sign out anyway",
      tone: "danger"
    });
    if (!confirmed) return;
  }

  await api.logout().catch(() => undefined);
  user.value = null;
  showAllErrors.value = false;
};

const openPreview = async () => {
  // Open the tab straight away so the browser doesn't treat it as an unwanted popup.
  const previewWindow = window.open("about:blank", "_blank");
  await editor.saveNow();

  if (saveState.value === "error") {
    previewWindow?.close();
    showToast("error", "Couldn't open the preview", "Your latest changes aren't saved yet. Please try again.");
    return;
  }

  if (previewWindow) {
    previewWindow.location.href = "/admin/preview";
  } else {
    window.location.href = "/admin/preview";
  }
};

const startPublish = async () => {
  if (totalErrors.value) {
    showAllErrors.value = true;
    const firstSection = sections.find((section) => errorCounts.value[section.id]);
    if (firstSection) await selectSection(firstSection.id);
    await nextTick();
    const firstField = document.querySelector<HTMLElement>(
      `[data-field-path="${Object.keys(errors.value).find((path) => document.querySelector(`[data-field-path="${path}"]`))}"]`
    );
    firstField?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstField?.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
    showToast(
      "error",
      `${totalErrors.value} ${totalErrors.value === 1 ? "thing needs" : "things need"} fixing before publishing`,
      "Look for the fields highlighted in red."
    );
    return;
  }

  const changed = sections.filter((section) => unpublishedSections.value.includes(section.id)).map((section) => section.label);
  const confirmed = await askConfirm({
    title: changed.length ? "Publish your changes?" : "Try publishing again?",
    body: changed.length
      ? "These sections will be updated on the live website. It usually takes 2–4 minutes."
      : "The website will be rebuilt with your current content. It usually takes 2–4 minutes.",
    items: changed,
    confirmLabel: "Publish now"
  });

  if (confirmed) {
    await editor.publish();
  }
};

const discardChanges = async () => {
  const confirmed = await askConfirm({
    title: "Discard unpublished changes?",
    body: "Everything will go back to what's currently on the live website. This can't be undone.",
    items: sections.filter((section) => unpublishedSections.value.includes(section.id)).map((section) => section.label),
    confirmLabel: "Discard changes",
    tone: "danger"
  });

  if (confirmed) {
    editor.discardUnpublished();
    showAllErrors.value = false;
    showToast("info", "Changes discarded", "The editor now matches the live website.");
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s" && user.value) {
    event.preventDefault();
    void editor.saveNow().then(() => {
      if (saveState.value !== "error") showToast("success", "Draft saved");
    });
  }
};

const onBeforeUnload = (event: BeforeUnloadEvent) => {
  if (user.value && (editor.hasUnsavedChanges.value || saveState.value === "saving")) {
    event.preventDefault();
    event.returnValue = "";
  }
};

const updateOnline = () => (isOnline.value = navigator.onLine);

watch(isOnline, (online) => {
  if (online && user.value && editor.hasUnsavedChanges.value) void editor.saveNow();
});

let clock: number | undefined;

onMounted(() => {
  updateOnline();
  window.addEventListener("online", updateOnline);
  window.addEventListener("offline", updateOnline);
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("beforeunload", onBeforeUnload);
  clock = window.setInterval(() => (now.value = new Date()), 30_000);
  void checkSession();
});

onBeforeUnmount(() => {
  window.removeEventListener("online", updateOnline);
  window.removeEventListener("offline", updateOnline);
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("beforeunload", onBeforeUnload);
  window.clearInterval(clock);
});
</script>

<template>
  <div class="admin-root min-h-screen bg-[#f5f2ee]">
    <!-- Checking for an existing session -->
    <div v-if="checkingSession" class="grid min-h-screen place-items-center">
      <div class="flex flex-col items-center gap-3 text-stone-500">
        <Loader2 class="animate-spin" :size="26" />
        <p class="text-sm">Loading your editor…</p>
      </div>
    </div>

    <!-- Sign in -->
    <div v-else-if="!user" class="grid min-h-screen place-items-center px-4 py-10">
      <div class="w-full max-w-sm">
        <div class="mb-6 text-center">
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Website editor</p>
          <h1 class="mt-2 font-serif text-3xl !font-light">{{ content.siteMetadata.name }}</h1>
        </div>
        <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
          <AdminLogin @signed-in="startEditor" />
        </div>
      </div>
    </div>

    <!-- Editor -->
    <div v-else class="min-h-screen pb-24 lg:pb-0">
      <header class="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div class="min-w-0 flex-1">
            <p class="truncate text-[15px] font-semibold text-stone-900">{{ content.siteMetadata.name }}</p>
            <p class="truncate text-xs text-stone-500">Website editor</p>
          </div>

          <div
            v-if="loadState === 'ready'"
            class="hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium md:inline-flex"
            :class="{
              'bg-stone-100 text-stone-600': status.tone === 'neutral',
              'bg-rose-50 text-rose-700': status.tone === 'error',
              'bg-amber-50 text-amber-800': status.tone === 'warning',
              'bg-emerald-50 text-emerald-700': status.tone === 'success'
            }"
            :title="lastSavedLabel ? `Last saved ${lastSavedLabel}` : undefined"
            role="status"
          >
            <Loader2 v-if="status.tone === 'neutral'" :size="13" class="animate-spin" />
            <AlertCircle v-else-if="status.tone === 'error'" :size="13" />
            <span v-else-if="status.tone === 'warning'" class="h-2 w-2 rounded-full bg-amber-500" />
            <CheckCircle2 v-else :size="13" />
            {{ status.label }}
          </div>

          <a :href="liveUrl" target="_blank" rel="noopener" class="admin-btn-ghost hidden sm:inline-flex" title="Open the live website in a new tab">
            <ExternalLink :size="16" />
            <span class="hidden xl:inline">View website</span>
          </a>
          <button
            type="button"
            class="admin-btn-secondary hidden sm:inline-flex"
            :disabled="loadState !== 'ready'"
            title="See your unpublished changes before visitors do"
            @click="openPreview"
          >
            <Eye :size="16" />
            Preview
          </button>
          <button type="button" class="admin-btn-primary hidden lg:inline-flex" :disabled="!canPublish" :title="publishTitle" @click="startPublish">
            <Loader2 v-if="editor.isDeploying.value" class="animate-spin" :size="16" />
            <Rocket v-else :size="16" />
            {{ editor.isDeploying.value ? "Publishing…" : "Publish changes" }}
            <span
              v-if="!editor.isDeploying.value && unpublishedSections.length"
              class="rounded-full bg-white/20 px-1.5 text-xs tabular-nums"
            >
              {{ unpublishedSections.length }}
            </span>
          </button>
          <button type="button" class="admin-icon-btn" :title="`Signed in as ${user.email}. Sign out`" aria-label="Sign out" @click="signOut">
            <LogOut :size="18" />
          </button>
        </div>
      </header>

      <div v-if="!isOnline" class="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900" role="status">
        <WifiOff :size="16" />
        You're offline. Keep editing — we'll save your changes when you reconnect.
      </div>

      <!-- Loading content -->
      <main v-if="loadState === 'loading'" class="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-8" aria-busy="true">
        <div class="hidden h-80 animate-pulse rounded-2xl bg-stone-200/70 lg:block" />
        <div class="grid gap-4">
          <div class="h-10 w-1/2 animate-pulse rounded-lg bg-stone-200/70" />
          <div class="h-72 animate-pulse rounded-2xl bg-stone-200/70" />
          <div class="h-48 animate-pulse rounded-2xl bg-stone-200/70" />
        </div>
      </main>

      <!-- Content failed to load -->
      <main v-else-if="loadState === 'error'" class="mx-auto grid max-w-lg place-items-center px-4 py-24 text-center">
        <AlertCircle :size="32" class="text-rose-500" />
        <h1 class="mt-4 text-lg font-semibold">We couldn't load your website content</h1>
        <p class="mt-2 text-sm text-stone-600">{{ editor.loadError.value }}</p>
        <button type="button" class="admin-btn-primary mt-6" @click="editor.load()">
          <RefreshCw :size="16" />
          Try again
        </button>
      </main>

      <main v-else class="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <!-- Section navigation -->
        <aside class="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Website sections" class="-mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:overflow-visible lg:p-0">
            <ul class="flex gap-2 lg:flex-col lg:gap-0.5">
              <li v-for="section in sections" :key="section.id" class="shrink-0">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-left text-sm transition lg:rounded-lg lg:border-transparent lg:px-3 lg:py-2.5"
                  :class="
                    activeSection === section.id
                      ? 'border-stone-900 bg-stone-900 text-white lg:border-transparent'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-white lg:bg-transparent lg:hover:bg-white'
                  "
                  :aria-current="activeSection === section.id ? 'page' : undefined"
                  @click="selectSection(section.id)"
                >
                  <span class="flex-1">{{ section.label }}</span>
                  <span
                    v-if="showAllErrors && errorCounts[section.id]"
                    class="rounded-full bg-rose-500 px-1.5 text-xs font-medium tabular-nums text-white"
                    :aria-label="`${errorCounts[section.id]} to fix`"
                  >
                    {{ errorCounts[section.id] }}
                  </span>
                  <span
                    v-else-if="unpublishedSections.includes(section.id)"
                    class="h-2 w-2 rounded-full bg-amber-500"
                    title="Has changes that aren't live yet"
                    aria-label="Not published yet"
                  />
                </button>
              </li>
            </ul>
          </nav>

          <div class="mt-6 hidden space-y-3 border-t border-stone-200 pt-4 text-xs text-stone-500 lg:block">
            <p v-if="unpublishedSections.length" class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-amber-500" />
              Changes not live yet
            </p>
            <p v-if="lastSavedLabel">Draft saved {{ lastSavedLabel }}</p>
            <p v-if="lastPublishedLabel">Last published {{ lastPublishedLabel }}</p>
            <button
              v-if="unpublishedSections.length && !editor.isDeploying.value"
              type="button"
              class="inline-flex items-center gap-1.5 font-medium text-stone-600 underline-offset-2 hover:text-rose-700 hover:underline"
              @click="discardChanges"
            >
              <Undo2 :size="14" />
              Discard unpublished changes
            </button>
          </div>
        </aside>

        <!-- Active section -->
        <div ref="contentTop" class="grid min-w-0 scroll-mt-24 grid-cols-1 content-start gap-5">
          <AdminDeployStatus
            v-if="deployJob"
            :job="deployJob"
            :live-url="liveUrl"
            :can-retry="canPublish"
            @retry="startPublish"
            @dismiss="editor.dismissDeployResult()"
          />

          <div
            v-if="saveState === 'error'"
            class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
            role="alert"
          >
            <p class="flex items-start gap-2 text-sm text-rose-800">
              <AlertCircle :size="18" class="mt-0.5 shrink-0" />
              <span><strong class="font-semibold">Your latest changes aren't saved.</strong> {{ editor.saveError.value }}</span>
            </p>
            <button type="button" class="admin-btn-secondary" @click="editor.saveNow()">
              <RefreshCw :size="16" />
              Try saving again
            </button>
          </div>

          <div>
            <h1 class="text-2xl font-semibold tracking-tight">{{ activeDefinition.label }}</h1>
            <p class="mt-1 text-[15px] text-stone-500">{{ activeDefinition.description }}</p>
          </div>

          <component :is="sectionComponents[activeSection]" :content="content" />
        </div>
      </main>

      <!-- Mobile action bar -->
      <div v-if="loadState === 'ready'" class="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div class="mx-auto flex max-w-3xl items-center gap-2">
          <p
            class="min-w-0 flex-1 truncate text-xs font-medium"
            :class="{
              'text-stone-500': status.tone === 'neutral',
              'text-rose-700': status.tone === 'error',
              'text-amber-800': status.tone === 'warning',
              'text-emerald-700': status.tone === 'success'
            }"
            role="status"
          >
            {{ status.label }}
          </p>
          <button type="button" class="admin-btn-secondary sm:hidden" aria-label="Preview" @click="openPreview">
            <Eye :size="16" />
          </button>
          <button type="button" class="admin-btn-primary" :disabled="!canPublish" :title="publishTitle" @click="startPublish">
            <Loader2 v-if="editor.isDeploying.value" class="animate-spin" :size="16" />
            <Rocket v-else :size="16" />
            {{ editor.isDeploying.value ? "Publishing…" : "Publish" }}
          </button>
        </div>
      </div>

      <!-- Session expired -->
      <div v-if="sessionExpired" class="fixed inset-0 z-[60] grid place-items-center bg-stone-900/40 p-4">
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="session-expired-title">
          <h2 id="session-expired-title" class="text-lg font-semibold">Please sign in again</h2>
          <p class="mb-5 mt-1 text-sm text-stone-600">For your security you were signed out. Your edits are still here.</p>
          <AdminLogin :default-email="user.email" @signed-in="onReauthenticated" />
        </div>
      </div>
    </div>

    <AdminConfirmDialog />
    <AdminToastStack />
  </div>
</template>
