import { authenticate, createSession, sessionCookie } from "../../_cms/auth";
import { badRequest, json, methodNotAllowed, readJson } from "../../_cms/http";
import type { CmsEnv } from "../../_cms/types";

type LoginBody = {
  email?: string;
  password?: string;
};

export const onRequestPost: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const body = await readJson<LoginBody>(request);

  if (!body?.email || !body.password) {
    return badRequest("Email and password are required.");
  }

  const user = await authenticate(env, body.email, body.password);

  if (!user) {
    return json({ error: "Invalid email or password." }, { status: 401 });
  }

  const session = await createSession(env, user.id);

  return json(
    { user },
    {
      headers: {
        "set-cookie": sessionCookie(session.sessionId, session.expiresAt)
      }
    }
  );
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
