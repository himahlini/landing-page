/// <reference types="@cloudflare/workers-types" />

export type CmsEnv = {
  DB: D1Database;
  CMS_ASSETS?: R2Bucket;
  CMS_ADMIN_EMAIL?: string;
  CMS_ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_URL?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_PAGES_PROJECT?: string;
  CLOUDFLARE_PAGES_PREVIEW_BRANCH?: string;
  CLOUDFLARE_DEPLOY_HOOK_URL?: string;
  CLOUDFLARE_PREVIEW_DEPLOY_HOOK_URL?: string;
  CLOUDFLARE_PRODUCTION_URL?: string;
  CLOUDFLARE_PREVIEW_URL?: string;
  GITHUB_DEPLOY_OWNER?: string;
  GITHUB_DEPLOY_REPO?: string;
  GITHUB_DEPLOY_WORKFLOW?: string;
  GITHUB_DEPLOY_REF?: string;
  GITHUB_DEPLOY_TOKEN?: string;
};

export type AuthedUser = {
  id: string;
  email: string;
};

export type ContentSnapshot = {
  id: string;
  kind: "draft" | "published";
  content_json: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type CmsJob = {
  id: string;
  type: "preview" | "deploy";
  status: "queued" | "running" | "success" | "failed";
  snapshot_id: string | null;
  target_branch: string | null;
  deployment_url: string | null;
  message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};
