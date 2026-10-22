import { getSessionUser } from "../_cms/auth";
import { getEditableContent, parseSnapshotContent, saveDraft, validateContent } from "../_cms/content";
import { badRequest, json, methodNotAllowed, readJson, unauthorized } from "../_cms/http";
import type { CmsEnv, ContentSnapshot } from "../_cms/types";

const snapshotMeta = (snapshot: ContentSnapshot | null) =>
  snapshot
    ? {
        id: snapshot.id,
        updatedAt: snapshot.updated_at,
        publishedAt: snapshot.published_at
      }
    : null;

const editorPayload = async (env: CmsEnv) => {
  const { content, draft, published } = await getEditableContent(env);

  return {
    content,
    // Without a published snapshot the live site is built from the seed content.
    publishedContent: parseSnapshotContent(published),
    draft: snapshotMeta(draft),
    published: snapshotMeta(published)
  };
};

type SaveContentBody = {
  content?: unknown;
};

export const onRequestGet: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  return json(await editorPayload(env));
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

  return json({ draftId, ...(await editorPayload(env)) });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
