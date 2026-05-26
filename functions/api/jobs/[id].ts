import { getSessionUser } from "../../_cms/auth";
import { json, methodNotAllowed, unauthorized } from "../../_cms/http";
import { getJob } from "../../_cms/jobs";
import type { CmsEnv } from "../../_cms/types";

export const onRequestGet: PagesFunction<CmsEnv> = async ({ request, env, params }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const job = await getJob(env, id);

  if (!job) {
    return json({ error: "Job not found" }, { status: 404 });
  }

  return json({ job });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
