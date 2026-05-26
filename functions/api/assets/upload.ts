import { AwsClient } from "aws4fetch";

import { getSessionUser } from "../../_cms/auth";
import { badRequest, json, methodNotAllowed, readJson, unauthorized } from "../../_cms/http";
import type { CmsEnv } from "../../_cms/types";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const maxFileSize = 5 * 1024 * 1024;

type UploadRequestBody = {
  filename?: string;
  contentType?: string;
  size?: number;
};

const extensionFor = (filename: string | undefined, contentType: string) => {
  const nameExtension = filename?.split(".").pop()?.toLowerCase();

  if (nameExtension && /^[a-z0-9]+$/.test(nameExtension)) {
    return nameExtension;
  }

  return contentType.split("/").pop()?.replace("svg+xml", "svg") ?? "bin";
};

export const onRequestPost: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const user = await getSessionUser(request, env);

  if (!user) {
    return unauthorized();
  }

  const body = await readJson<UploadRequestBody>(request);
  const filename = body?.filename?.trim();
  const contentType = body?.contentType?.trim();
  const fileSize = body?.size;

  if (!filename || !contentType) {
    return badRequest("Upload requires a filename and content type.");
  }

  if (!allowedTypes.has(contentType)) {
    return badRequest("Only JPG, PNG, WebP, GIF, and SVG files are allowed.");
  }

  if (typeof fileSize === "number" && fileSize > maxFileSize) {
    return badRequest("Image must be 5MB or smaller.");
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const bucketName = env.R2_BUCKET_NAME;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const publicUrl = env.R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!accountId || !bucketName || !accessKeyId || !secretAccessKey || !publicUrl) {
    return badRequest("R2 asset storage is not configured.");
  }

  const key = `cms/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensionFor(filename, contentType)}`;
  const objectUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
  const aws = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto"
  });

  const signedRequest = await aws.sign(objectUrl, {
    method: "PUT",
    headers: {
      "content-type": contentType
    },
    aws: {
      signQuery: true
    }
  });

  return json({
    key,
    url: `${publicUrl}/${key}`,
    uploadUrl: signedRequest.url,
    headers: {
      "content-type": contentType
    }
  });
};

export const onRequest: PagesFunction<CmsEnv> = () => methodNotAllowed();
