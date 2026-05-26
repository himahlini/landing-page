import type { AuthedUser, CmsEnv } from "./types";
import { hashPassword, randomId, verifyPassword } from "./crypto";

const sessionCookieName = "cms_session";
const sessionDays = 7;

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
};

const nowIso = () => new Date().toISOString();

const getCookie = (request: Request, name: string) => {
  const cookies = request.headers.get("cookie") ?? "";
  const match = cookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

export const sessionCookie = (sessionId: string, expiresAt: string) =>
  `${sessionCookieName}=${encodeURIComponent(sessionId)}; Expires=${new Date(expiresAt).toUTCString()}; Path=/; HttpOnly; Secure; SameSite=Lax`;

export const clearSessionCookie = () =>
  `${sessionCookieName}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly; Secure; SameSite=Lax`;

export const ensureBootstrapUser = async (env: CmsEnv) => {
  const existing = await env.DB.prepare("SELECT id, email, password_hash FROM admin_users LIMIT 1").first<AdminUserRow>();

  if (existing) {
    return existing;
  }

  const email = env.CMS_ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.CMS_ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  const timestamp = nowIso();
  const user = {
    id: randomId(),
    email,
    password_hash: await hashPassword(password)
  };

  await env.DB.prepare(
    "INSERT INTO admin_users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(user.id, user.email, user.password_hash, timestamp, timestamp)
    .run();

  return user;
};

export const authenticate = async (env: CmsEnv, email: string, password: string) => {
  await ensureBootstrapUser(env);

  const user = await env.DB.prepare("SELECT id, email, password_hash FROM admin_users WHERE email = ?")
    .bind(email.trim().toLowerCase())
    .first<AdminUserRow>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return null;
  }

  return { id: user.id, email: user.email };
};

export const createSession = async (env: CmsEnv, userId: string) => {
  const sessionId = randomId();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + sessionDays * 24 * 60 * 60 * 1000);

  await env.DB.prepare("INSERT INTO admin_sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(sessionId, userId, expiresAt.toISOString(), createdAt.toISOString())
    .run();

  return {
    sessionId,
    expiresAt: expiresAt.toISOString()
  };
};

export const getSessionUser = async (request: Request, env: CmsEnv): Promise<AuthedUser | null> => {
  const sessionId = getCookie(request, sessionCookieName);

  if (!sessionId) {
    return null;
  }

  const user = await env.DB.prepare(
    `SELECT admin_users.id, admin_users.email
     FROM admin_sessions
     JOIN admin_users ON admin_users.id = admin_sessions.user_id
     WHERE admin_sessions.id = ? AND admin_sessions.expires_at > ?`
  )
    .bind(sessionId, nowIso())
    .first<AuthedUser>();

  return user ?? null;
};

export const deleteSession = async (request: Request, env: CmsEnv) => {
  const sessionId = getCookie(request, sessionCookieName);

  if (sessionId) {
    await env.DB.prepare("DELETE FROM admin_sessions WHERE id = ?").bind(sessionId).run();
  }
};
