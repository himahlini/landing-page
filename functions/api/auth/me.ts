import { getSessionUser } from "../../_cms/auth";
import { json, methodNotAllowed, unauthorized } from "../../_cms/http";
import type { CmsEnv } from "../../_cms/types";

export const onRequestGet: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  return json({ user });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
