import seedContent from "../../src/content/site-content.json";
import type { ContentSnapshot, CmsEnv } from "./types";
import { randomId } from "./crypto";

export const defaultContent = seedContent;

const nowIso = () => new Date().toISOString();
const cloneDefaultContent = () => structuredClone(defaultContent);

export const normalizeContent = (content: unknown) => {
  if (!validateContent(content)) {
    return cloneDefaultContent();
  }

  const value = structuredClone(content as typeof seedContent);

  value.practiceAreas = value.practiceAreas.map((practice) => {
    const { image: _unusedImage, ...normalizedPractice } = practice as typeof practice & { image?: string };
    return normalizedPractice;
  });

  return value;
};

export const validateContent = (content: unknown) => {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return false;
  }

  const value = content as Record<string, unknown>;
  return Boolean(
    value.siteMetadata &&
      value.navigation &&
      value.hero &&
      value.practiceOverview &&
      Array.isArray(value.practiceAreas) &&
      value.about &&
      value.people &&
      value.contact &&
      value.footer &&
      value.detailPage
  );
};

export const parseSnapshotContent = (snapshot: ContentSnapshot | null) => {
  if (!snapshot) {
    return cloneDefaultContent();
  }

  try {
    return normalizeContent(JSON.parse(snapshot.content_json));
  } catch {
    return cloneDefaultContent();
  }
};

export const getLatestSnapshot = async (env: CmsEnv, kind: "draft" | "published") =>
  env.DB.prepare("SELECT * FROM content_snapshots WHERE kind = ? ORDER BY updated_at DESC LIMIT 1")
    .bind(kind)
    .first<ContentSnapshot>();

export const getEditableContent = async (env: CmsEnv) => {
  const draft = await getLatestSnapshot(env, "draft");
  const published = await getLatestSnapshot(env, "published");

  return {
    content: parseSnapshotContent(draft ?? published),
    draft,
    published
  };
};

export const saveDraft = async (env: CmsEnv, content: unknown, userId: string) => {
  const timestamp = nowIso();
  const snapshot = await getLatestSnapshot(env, "draft");
  const contentJson = JSON.stringify(normalizeContent(content), null, 2);

  if (snapshot) {
    await env.DB.prepare("UPDATE content_snapshots SET content_json = ?, created_by = ?, updated_at = ? WHERE id = ?")
      .bind(contentJson, userId, timestamp, snapshot.id)
      .run();

    return snapshot.id;
  }

  const id = randomId();
  await env.DB.prepare(
    "INSERT INTO content_snapshots (id, kind, content_json, created_by, created_at, updated_at) VALUES (?, 'draft', ?, ?, ?, ?)"
  )
    .bind(id, contentJson, userId, timestamp, timestamp)
    .run();

  return id;
};

export const publishDraft = async (env: CmsEnv, userId: string) => {
  const draft = await getLatestSnapshot(env, "draft");
  const timestamp = nowIso();
  const contentJson = draft?.content_json ?? JSON.stringify(cloneDefaultContent(), null, 2);
  const published = await getLatestSnapshot(env, "published");

  if (published) {
    await env.DB.prepare(
      "UPDATE content_snapshots SET content_json = ?, created_by = ?, updated_at = ?, published_at = ? WHERE id = ?"
    )
      .bind(contentJson, userId, timestamp, timestamp, published.id)
      .run();

    return published.id;
  }

  const id = randomId();
  await env.DB.prepare(
    "INSERT INTO content_snapshots (id, kind, content_json, created_by, created_at, updated_at, published_at) VALUES (?, 'published', ?, ?, ?, ?, ?)"
  )
    .bind(id, contentJson, userId, timestamp, timestamp, timestamp)
    .run();

  return id;
};
