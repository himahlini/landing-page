import { badRequest, json, methodNotAllowed, readJson } from "../../../_cms/http";
import { getJob, updateJob } from "../../../_cms/jobs";
import type { CmsEnv } from "../../../_cms/types";

type CompleteJobBody = {
  status?: "success" | "failed" | "cancelled";
  message?: string;
  deploymentUrl?: string;
};

const isValidStatus = (status: unknown): status is CompleteJobBody["status"] =>
  status === "success" || status === "failed" || status === "cancelled";

export const onRequestPost: PagesFunction<CmsEnv> = async ({ request, env, params }) => {
  const callbackToken = env.CMS_DEPLOY_CALLBACK_TOKEN;
  const authorization = request.headers.get("authorization");

  if (!callbackToken || authorization !== `Bearer ${callbackToken}`) {
    return json({ error: "Invalid deployment callback token." }, { status: 401 });
  }

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const job = await getJob(env, id);

  if (!job) {
    return json({ error: "Job not found" }, { status: 404 });
  }

  const body = await readJson<CompleteJobBody>(request);

  if (!isValidStatus(body?.status)) {
    return badRequest("A valid deployment status is required.");
  }

  const status = body.status === "cancelled" ? "failed" : body.status;
  const message =
    body.message ??
    (body.status === "success" ? "GitHub Actions deployment completed." : "GitHub Actions deployment failed.");

  await updateJob(env, id, {
    status,
    deploymentUrl: body.deploymentUrl ?? env.CLOUDFLARE_PRODUCTION_URL ?? null,
    message,
    completed: true
  });

  return json({ job: await getJob(env, id) });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
