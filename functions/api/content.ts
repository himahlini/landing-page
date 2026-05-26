import { getSessionUser } from "../_cms/auth";
import { getEditableContent, saveDraft, validateContent } from "../_cms/content";
import { badRequest, json, methodNotAllowed, readJson, unauthorized } from "../_cms/http";
import type { CmsEnv } from "../_cms/types";

type SaveContentBody = {
  content?: unknown;
};

export const onRequestGet: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  const content = await getEditableContent(env);

  return json({
    content: content.content,
    draft: content.draft,
    published: content.published
  });
};

export const onRequestPut: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  const body = await readJson<SaveContentBody>(request);

  if (!validateContent(body?.content)) {
    return badRequest("Content does not match the expected site-content shape.");
  }

  const draftId = await saveDraft(env, body.content, user.id);
  const content = await getEditableContent(env);

  return json({
    draftId,
    content: content.content,
    draft: content.draft,
    published: content.published
  });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
