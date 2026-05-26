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

const renderDocument = (template, appHtml, title, description, siteState) =>
  template
    .replace("<!--app-title-->", title)
    .replace("<!--app-description-->", description)
    .replace("<!--app-html-->", appHtml)
    .replace("<!--app-state-->", siteState);

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

const routes = [
  "/",
  "/about",
  ...content.practiceAreas.map((practice) => `/practice/${practice.slug}`)
];

for (const route of routes) {
  const { appHtml, title, description, siteContentJson } = await render(route, content);
  const html = renderDocument(template, appHtml, title, description, siteContentJson);
  const outputDir = route === "/" ? distClientDir : path.join(distClientDir, route.slice(1));
  const outputFile = route === "/" ? templatePath : path.join(outputDir, "index.html");

  if (route !== "/") {
    await fs.mkdir(outputDir, { recursive: true });
  }

  await fs.writeFile(outputFile, html);
}

console.log(`Prerendered ${routes.length} routes for Cloudflare Pages.`);
