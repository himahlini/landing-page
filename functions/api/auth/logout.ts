import { clearSessionCookie, deleteSession } from "../../_cms/auth";
import { json, methodNotAllowed } from "../../_cms/http";
import type { CmsEnv } from "../../_cms/types";

export const onRequestPost: PagesFunction<CmsEnv> = async ({ request, env }) => {
  await deleteSession(request, env);

  return json(
    { ok: true },
    {
      headers: {
        "set-cookie": clearSessionCookie()
      }
    }
  );
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
