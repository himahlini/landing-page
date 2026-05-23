import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distClientDir = path.join(rootDir, "dist/client");
const templatePath = path.join(distClientDir, "index.html");
const contentPath = path.join(rootDir, "src/content/site-content.json");
const serverEntryPath = path.join(rootDir, "dist/server/entry-server.js");

const renderDocument = (template, appHtml, title, description) =>
  template
    .replace("<!--app-title-->", title)
    .replace("<!--app-description-->", description)
    .replace("<!--app-html-->", appHtml);

const content = JSON.parse(await fs.readFile(contentPath, "utf8"));
const template = await fs.readFile(templatePath, "utf8");
const { render } = await import(pathToFileURL(serverEntryPath).href);

const routes = [
  "/",
  "/about",
  ...content.practiceAreas.map((practice) => `/practice/${practice.slug}`)
];

for (const route of routes) {
  const { appHtml, title, description } = await render(route);
  const html = renderDocument(template, appHtml, title, description);
  const outputDir = route === "/" ? distClientDir : path.join(distClientDir, route.slice(1));
  const outputFile = route === "/" ? templatePath : path.join(outputDir, "index.html");

  if (route !== "/") {
    await fs.mkdir(outputDir, { recursive: true });
  }

  await fs.writeFile(outputFile, html);
}

console.log(`Prerendered ${routes.length} routes for Cloudflare Pages.`);
