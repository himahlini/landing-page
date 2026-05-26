import { getSessionUser } from "../../_cms/auth";
import { publishDraft, saveDraft, validateContent } from "../../_cms/content";
import { badRequest, json, methodNotAllowed, readJson, unauthorized } from "../../_cms/http";
import { createJob, getJob, updateJob } from "../../_cms/jobs";
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

    return json({ job: await getJob(env, jobId) }, { status: 502 });
  }

  await updateJob(env, jobId, {
    status: "running",
    deploymentUrl: env.CLOUDFLARE_PRODUCTION_URL ?? null,
    message: "GitHub Actions deployment dispatched. Waiting for the workflow to finish."
  });

  return json({
    job: await getJob(env, jobId),
    message: "Deploy started. Please check back in a few minutes."
  });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
