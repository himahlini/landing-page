import { getSessionUser } from "../../_cms/auth";
import { json, methodNotAllowed, unauthorized } from "../../_cms/http";
import { getLatestJob, syncDeployJob } from "../../_cms/jobs";
import type { CmsEnv } from "../../_cms/types";

export const onRequestGet: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  const job = await getLatestJob(env, "deploy");

  return json({ job: job ? await syncDeployJob(env, job) : null });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
