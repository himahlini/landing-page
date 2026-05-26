import { randomId } from "./crypto";
import type { CmsEnv, CmsJob } from "./types";

const nowIso = () => new Date().toISOString();

type CreateJobInput = {
  type: CmsJob["type"];
  snapshotId: string | null;
  targetBranch?: string | null;
  deploymentUrl?: string | null;
  createdBy: string;
  message?: string | null;
};

type UpdateJobInput = {
  status: CmsJob["status"];
  deploymentUrl?: string | null;
  message?: string | null;
  completed?: boolean;
};

export const createJob = async (env: CmsEnv, input: CreateJobInput) => {
  const timestamp = nowIso();
  const id = randomId();

  await env.DB.prepare(
    `INSERT INTO cms_jobs
      (id, type, status, snapshot_id, target_branch, deployment_url, message, created_by, created_at, updated_at)
     VALUES (?, ?, 'running', ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      input.type,
      input.snapshotId,
      input.targetBranch ?? null,
      input.deploymentUrl ?? null,
      input.message ?? null,
      input.createdBy,
      timestamp,
      timestamp
    )
    .run();

  return id;
};

export const updateJob = async (env: CmsEnv, jobId: string, input: UpdateJobInput) => {
  const timestamp = nowIso();
  const completedAt = input.completed ? timestamp : null;

  await env.DB.prepare(
    `UPDATE cms_jobs
     SET status = ?, deployment_url = COALESCE(?, deployment_url), message = COALESCE(?, message), updated_at = ?, completed_at = ?
     WHERE id = ?`
  )
    .bind(input.status, input.deploymentUrl ?? null, input.message ?? null, timestamp, completedAt, jobId)
    .run();
};

export const getJob = async (env: CmsEnv, jobId: string) =>
  env.DB.prepare("SELECT * FROM cms_jobs WHERE id = ?").bind(jobId).first<CmsJob>();

export const triggerDeployHook = async (hookUrl: string | undefined, payload: unknown) => {
  if (!hookUrl) {
    return {
      ok: false,
      message: "Deploy hook URL is not configured."
    };
  }

  const response = await fetch(hookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return {
      ok: false,
      message: text || `Deploy hook failed with HTTP ${response.status}.`
    };
  }

  return {
    ok: true,
    message: "Deploy hook triggered."
  };
};
