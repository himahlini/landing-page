import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, ".cms/site-content.json");
const seedContentPath = path.join(rootDir, "src/content/site-content.json");
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID ?? "246e9898-746a-424d-94d1-76bfcc6b35e9";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

const writeContent = async (content) => {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(content, null, 2)}\n`);
};

if (!accountId || !apiToken) {
  if (process.env.CMS_CONTENT_ALLOW_SEED_FALLBACK === "1") {
    const seedContent = JSON.parse(await fs.readFile(seedContentPath, "utf8"));
    await writeContent(seedContent);
    console.log("CMS credentials are missing. Wrote seed site-content.json fallback.");
    process.exit(0);
  }

  throw new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required to pull CMS content.");
}

const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${apiToken}`,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    sql: "SELECT content_json FROM content_snapshots WHERE kind = 'published' ORDER BY updated_at DESC LIMIT 1"
  })
});

if (!response.ok) {
  throw new Error(`Cloudflare D1 query failed with HTTP ${response.status}: ${await response.text()}`);
}

const payload = await response.json();
const resultSet = payload?.result?.[0];
const contentJson = resultSet?.results?.[0]?.content_json;

if (!payload?.success || !contentJson) {
  const seedContent = JSON.parse(await fs.readFile(seedContentPath, "utf8"));
  await writeContent(seedContent);
  console.log("No published CMS snapshot found. Wrote seed site-content.json fallback.");
  process.exit(0);
}

await writeContent(JSON.parse(contentJson));
console.log(`Wrote published CMS content to ${path.relative(rootDir, outputPath)}.`);
