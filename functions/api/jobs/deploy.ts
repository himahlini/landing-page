import { getSessionUser } from "../../_cms/auth";
import { publishDraft, saveDraft, validateContent } from "../../_cms/content";
import { badRequest, json, methodNotAllowed, readJson, unauthorized } from "../../_cms/http";
import { createJob, getJob, getLatestJob, syncDeployJob, updateJob } from "../../_cms/jobs";
import { dispatchGithubWorkflow } from "../../_cms/github";
import type { CmsEnv } from "../../_cms/types";

type JobRequestBody = {
  content?: unknown;
};

export const onRequestPost: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  const body = await readJson<JobRequestBody>(request);

  if (!validateContent(body?.content)) {
    return badRequest("Content does not match the expected site-content shape.");
  }

  const latestJob = await getLatestJob(env, "deploy");
  const activeJob = latestJob ? await syncDeployJob(env, latestJob) : null;

  // The workflow cancels in-progress runs, so a second publish would abort the first one.
  if (activeJob && (activeJob.status === "running" || activeJob.status === "queued")) {
    return json({ error: "A publish is already in progress. Please wait for it to finish.", job: activeJob }, { status: 409 });
  }

  await saveDraft(env, body.content, user.id);
  const snapshotId = await publishDraft(env, user.id);
  const jobId = await createJob(env, {
    type: "deploy",
    snapshotId,
    targetBranch: "main",
    deploymentUrl: env.CLOUDFLARE_PRODUCTION_URL ?? null,
    createdBy: user.id
  });

  const dispatchResult = await dispatchGithubWorkflow(env, {});

  if (!dispatchResult.ok) {
    await updateJob(env, jobId, {
      status: "failed",
      deploymentUrl: env.CLOUDFLARE_PRODUCTION_URL ?? null,
      message: dispatchResult.message,
      completed: true
    });

    const failedJob = await getJob(env, jobId);
    return json(
      {
        error: "The website could not start publishing. Your changes are saved, so you can try again.",
        job: failedJob ? await syncDeployJob(env, failedJob) : null
      },
      { status: 502 }
    );
  }

  await updateJob(env, jobId, {
    status: "running",
    deploymentUrl: env.CLOUDFLARE_PRODUCTION_URL ?? null,
    message: "GitHub Actions deployment dispatched. Waiting for the workflow to finish."
  });

  const job = await getJob(env, jobId);

  return json({
    job: job ? await syncDeployJob(env, job) : null,
    message: "Deploy started. Please check back in a few minutes."
  });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
