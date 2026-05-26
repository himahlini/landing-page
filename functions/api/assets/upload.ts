import { getSessionUser } from "../../_cms/auth";
import { badRequest, json, methodNotAllowed, unauthorized } from "../../_cms/http";
import type { CmsEnv } from "../../_cms/types";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const maxFileSize = 5 * 1024 * 1024;

const extensionFor = (file: File) => {
  const nameExtension = file.name.split(".").pop()?.toLowerCase();

  if (nameExtension && /^[a-z0-9]+$/.test(nameExtension)) {
    return nameExtension;
  }

  return file.type.split("/").pop()?.replace("svg+xml", "svg") ?? "bin";
};

export const onRequestPost: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  if (!env.CMS_ASSETS || !env.R2_PUBLIC_URL) {
    return badRequest("R2 asset storage is not configured.");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return badRequest("Upload requires a file.");
  }

  if (!allowedTypes.has(file.type)) {
    return badRequest("Only JPG, PNG, WebP, GIF, and SVG files are allowed.");
  }

  if (file.size > maxFileSize) {
    return badRequest("Image must be 5MB or smaller.");
  }

  const key = `cms/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensionFor(file)}`;

  await env.CMS_ASSETS.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable"
    }
  });

  return json({
    key,
    url: `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`
  });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
