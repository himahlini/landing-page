import { getSessionUser } from "../../_cms/auth";
import { saveDraft, validateContent } from "../../_cms/content";
import { badRequest, json, methodNotAllowed, readJson, unauthorized } from "../../_cms/http";
import { createJob, getJob, triggerDeployHook, updateJob } from "../../_cms/jobs";
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

  const snapshotId = await saveDraft(env, body.content, user.id);
  const targetBranch = env.CLOUDFLARE_PAGES_PREVIEW_BRANCH ?? "cms-preview";
  const fallbackUrl =
    env.CLOUDFLARE_PREVIEW_URL ??
    (env.CLOUDFLARE_PAGES_PROJECT ? `https://${targetBranch}.${env.CLOUDFLARE_PAGES_PROJECT}.pages.dev` : null);
  const jobId = await createJob(env, {
    type: "preview",
    snapshotId,
    targetBranch,
    deploymentUrl: fallbackUrl,
    createdBy: user.id
  });

  const hookResult = await triggerDeployHook(env.CLOUDFLARE_PREVIEW_DEPLOY_HOOK_URL, {
    jobId,
    snapshotId,
    targetBranch,
    type: "preview"
  });

  await updateJob(env, jobId, {
    status: hookResult.ok ? "success" : "failed",
    deploymentUrl: fallbackUrl,
    message: hookResult.message,
    completed: true
  });

  return json({ job: await getJob(env, jobId) });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
