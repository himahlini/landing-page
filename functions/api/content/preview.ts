import { getSessionUser } from "../../_cms/auth";
import { getLatestSnapshot, parseSnapshotContent } from "../../_cms/content";
import { json, methodNotAllowed, unauthorized } from "../../_cms/http";
import type { CmsEnv } from "../../_cms/types";

export const onRequestGet: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  const draft = await getLatestSnapshot(env, "draft");

  return json({
    content: parseSnapshotContent(draft),
    draft
  });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
