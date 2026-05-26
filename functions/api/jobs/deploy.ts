import { getSessionUser } from "../../_cms/auth";
import { publishDraft, saveDraft, validateContent } from "../../_cms/content";
import { badRequest, json, methodNotAllowed, readJson, unauthorized } from "../../_cms/http";
import { createJob, getJob, updateJob } from "../../_cms/jobs";
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

  await updateJob(env, jobId, {
    status: "success",
    deploymentUrl: env.CLOUDFLARE_PRODUCTION_URL ?? null,
    message: "Published content snapshot. Run the Cloudflare deploy command to rebuild the static site.",
    completed: true
  });

  return json({ job: await getJob(env, jobId) });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
