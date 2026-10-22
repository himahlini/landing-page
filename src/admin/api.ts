import type { SiteContent } from "../content/site-content";

export type AdminUser = {
  id: string;
  email: string;
};

export type SnapshotMeta = {
  id: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type EditorPayload = {
  content: SiteContent;
  publishedContent: SiteContent;
  draft: SnapshotMeta | null;
  published: SnapshotMeta | null;
};

export type DeployStage = "queued" | "preparing" | "building" | "success" | "failed";

export type DeployJob = {
  id: string;
  status: "queued" | "running" | "success" | "failed";
  stage: DeployStage;
  deployment_url: string | null;
  run_url: string | null;
  message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type UploadSession = {
  key: string;
  url: string;
  uploadUrl: string;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  body: Record<string, unknown> | null;

  constructor(message: string, status: number, body: Record<string, unknown> | null = null) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;

const offlineMessage = "We couldn't reach the server. Please check your internet connection and try again.";

const friendlyStatusMessage = (status: number) => {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 413) return "That file is too large.";
  if (status >= 500) return "Something went wrong on our side. Please try again in a moment.";
  return "Something went wrong. Please try again.";
};

export const errorMessage = (error: unknown, fallback = "Something went wrong. Please try again.") =>
  error instanceof Error && error.message ? error.message : fallback;

export const requestJson = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        "content-type": "application/json",
        ...options.headers
      }
    });
  } catch {
    throw new ApiError(offlineMessage, 0);
  }

  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    const serverMessage = typeof body?.error === "string" && response.status !== 401 ? body.error : "";
    throw new ApiError(serverMessage || friendlyStatusMessage(response.status), response.status, body);
  }

  return body as T;
};

export const api = {
  me: () => requestJson<{ user: AdminUser }>("/api/auth/me"),
  login: (email: string, password: string) =>
    requestJson<{ user: AdminUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  logout: () => requestJson("/api/auth/logout", { method: "POST", body: "{}" }),
  loadContent: () => requestJson<EditorPayload>("/api/content"),
  saveDraft: (content: SiteContent) =>
    requestJson<EditorPayload>("/api/content", {
      method: "PUT",
      body: JSON.stringify({ content })
    }),
  loadDraftPreview: () => requestJson<{ content: SiteContent }>("/api/content/preview"),
  publish: (content: SiteContent) =>
    requestJson<{ job: DeployJob | null }>("/api/jobs/deploy", {
      method: "POST",
      body: JSON.stringify({ content })
    }),
  getJob: (id: string) => requestJson<{ job: DeployJob }>(`/api/jobs/${id}`),
  latestDeploy: () => requestJson<{ job: DeployJob | null }>("/api/jobs/latest"),
  requestUpload: (file: File) =>
    requestJson<UploadSession>("/api/assets/upload", {
      method: "POST",
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size })
    })
};

// XHR rather than fetch so the editor can show upload progress.
export const uploadToSignedUrl = (file: File, upload: UploadSession, onProgress: (percent: number) => void) =>
  new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", upload.uploadUrl);
    Object.entries(upload.headers ?? {}).forEach(([name, value]) => request.setRequestHeader(name, value));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error("The image couldn't be uploaded. Please try again."));
    request.onerror = () => reject(new Error(offlineMessage));
    request.send(file);
  });
