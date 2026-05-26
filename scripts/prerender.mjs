import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distClientDir = path.join(rootDir, "dist/client");
const templatePath = path.join(distClientDir, "index.html");
const seedContentPath = path.join(rootDir, "src/content/site-content.json");
const generatedContentPath = path.join(rootDir, ".cms/site-content.json");
const contentPath = process.env.CMS_CONTENT_FILE
  ? path.resolve(rootDir, process.env.CMS_CONTENT_FILE)
  : generatedContentPath;
const serverEntryPath = path.join(rootDir, "dist/server/entry-server.js");
const siteUrl = (process.env.CLOUDFLARE_PRODUCTION_URL || process.env.VITE_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

const renderDocument = (template, appHtml, head, siteState) =>
  template
    .replace('data-app-html-attrs=""', head.htmlAttrs)
    .replace('data-app-body-attrs=""', head.bodyAttrs)
    .replace("<!--app-head-->", head.headTags)
    .replace("<!--app-body-tags-open-->", head.bodyTagsOpen)
    .replace("<!--app-html-->", appHtml)
    .replace("<!--app-state-->", siteState)
    .replace("<!--app-body-tags-->", head.bodyTags);

const getPublicRoutes = (siteContent) => [
  "/",
  "/about",
  ...siteContent.practiceAreas.map((practice) => `/practice/${practice.slug}`)
];

const buildSitemapXml = (routes) => {
  const lastmod = new Date().toISOString();
  const urls = routes
    .map((route) => {
      const location = new URL(route, `${siteUrl}/`).toString();
      return [
        "  <url>",
        `    <loc>${location}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        "  </url>"
      ].join("\n");
    })
    .join("\n");

  return [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    urls,
    "</urlset>"
  ].join("\n");
};

const buildRobotsTxt = () => [
  "User-agent: *",
  "Allow: /",
  "Disallow: /admin",
  "",
  `Sitemap: ${new URL("/sitemap.xml", `${siteUrl}/`).toString()}`
].join("\n");

const readContent = async () => {
  try {
    return JSON.parse(await fs.readFile(contentPath, "utf8"));
  } catch (error) {
    if (process.env.CMS_CONTENT_FILE) {
      throw error;
    }

    return JSON.parse(await fs.readFile(seedContentPath, "utf8"));
  }
};

const content = await readContent();
const template = await fs.readFile(templatePath, "utf8");
const { render } = await import(pathToFileURL(serverEntryPath).href);
const routes = getPublicRoutes(content);

for (const route of routes) {
  const { appHtml, headTags, htmlAttrs, bodyAttrs, bodyTags, bodyTagsOpen, siteContentJson } = await render(route, content);
  const html = renderDocument(template, appHtml, { headTags, htmlAttrs, bodyAttrs, bodyTags, bodyTagsOpen }, siteContentJson);
  const outputDir = route === "/" ? distClientDir : path.join(distClientDir, route.slice(1));
  const outputFile = route === "/" ? templatePath : path.join(outputDir, "index.html");

  if (route !== "/") {
    await fs.mkdir(outputDir, { recursive: true });
  }

  await fs.writeFile(outputFile, html);
}

await fs.writeFile(path.join(distClientDir, "sitemap.xml"), buildSitemapXml(routes));
await fs.writeFile(path.join(distClientDir, "robots.txt"), buildRobotsTxt());

console.log(`Prerendered ${routes.length} routes for Cloudflare Pages.`);
