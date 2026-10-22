import type { CmsEnv } from "./types";

type WorkflowDispatchInput = {
  owner?: string;
  repo?: string;
  workflow?: string;
  ref?: string;
};

export const dispatchGithubWorkflow = async (env: CmsEnv, input: WorkflowDispatchInput) => {
  const owner = input.owner ?? env.GITHUB_DEPLOY_OWNER;
  const repo = input.repo ?? env.GITHUB_DEPLOY_REPO;
  const workflow = input.workflow ?? env.GITHUB_DEPLOY_WORKFLOW ?? "deploy.yml";
  const ref = input.ref ?? env.GITHUB_DEPLOY_REF ?? "main";
  const token = env.GITHUB_DEPLOY_TOKEN;

  if (!owner || !repo || !token) {
    return {
      ok: false,
      message: "GitHub deploy configuration is incomplete."
    };
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "himahlini-cms",
      "x-github-api-version": "2022-11-28"
    },
    body: JSON.stringify({
      ref
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return {
      ok: false,
      message: text || `GitHub workflow dispatch failed with HTTP ${response.status}.`
    };
  }

  return {
    ok: true,
    message: "GitHub workflow dispatched."
  };
};

export type DeployStage = "queued" | "preparing" | "building" | "success" | "failed";

export type WorkflowRunProgress = {
  stage: DeployStage;
  conclusion: string | null;
  runUrl: string | null;
};

type WorkflowRun = {
  id: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
};

type WorkflowJob = {
  steps?: { name: string; status: string }[];
};

const githubHeaders = (token: string) => ({
  authorization: `Bearer ${token}`,
  accept: "application/vnd.github+json",
  "user-agent": "himahlini-cms",
  "x-github-api-version": "2022-11-28"
});

// GitHub does not return a run id from a workflow dispatch, so the run is matched by creation time.
export const findWorkflowRunProgress = async (env: CmsEnv, since: string): Promise<WorkflowRunProgress | null> => {
  const owner = env.GITHUB_DEPLOY_OWNER;
  const repo = env.GITHUB_DEPLOY_REPO;
  const workflow = env.GITHUB_DEPLOY_WORKFLOW ?? "deploy.yml";
  const token = env.GITHUB_DEPLOY_TOKEN;

  if (!owner || !repo || !token) {
    return null;
  }

  const createdAfter = new Date(new Date(since).getTime() - 10_000).toISOString().replace(/\.\d{3}Z$/, "Z");
  const base = `https://api.github.com/repos/${owner}/${repo}/actions`;
  const runsResponse = await fetch(
    `${base}/workflows/${workflow}/runs?event=workflow_dispatch&per_page=10&created=${encodeURIComponent(`>=${createdAfter}`)}`,
    { headers: githubHeaders(token) }
  );

  if (!runsResponse.ok) {
    return null;
  }

  const { workflow_runs: runs = [] } = (await runsResponse.json()) as { workflow_runs?: WorkflowRun[] };
  const run = [...runs].sort((a, b) => a.created_at.localeCompare(b.created_at))[0];

  if (!run) {
    return null;
  }

  if (run.status === "completed") {
    return {
      stage: run.conclusion === "success" ? "success" : "failed",
      conclusion: run.conclusion,
      runUrl: run.html_url
    };
  }

  if (run.status !== "in_progress") {
    return { stage: "queued", conclusion: null, runUrl: run.html_url };
  }

  const jobsResponse = await fetch(`${base}/runs/${run.id}/jobs`, { headers: githubHeaders(token) });
  const { jobs = [] } = jobsResponse.ok ? ((await jobsResponse.json()) as { jobs?: WorkflowJob[] }) : {};
  const currentStep = jobs[0]?.steps?.find((step) => step.status === "in_progress")?.name ?? "";

  return {
    stage: /build|deploy/i.test(currentStep) ? "building" : "preparing",
    conclusion: null,
    runUrl: run.html_url
  };
};
