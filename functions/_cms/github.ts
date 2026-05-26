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
