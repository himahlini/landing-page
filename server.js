import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 3000;

const renderDocument = (template, appHtml, head, siteState) =>
  template
    .replace('data-app-html-attrs=""', head.htmlAttrs)
    .replace('data-app-body-attrs=""', head.bodyAttrs)
    .replace("<!--app-head-->", head.headTags)
    .replace("<!--app-body-tags-open-->", head.bodyTagsOpen)
    .replace("<!--app-html-->", appHtml)
    .replace("<!--app-state-->", siteState)
    .replace("<!--app-body-tags-->", head.bodyTags);

const start = async () => {
  const app = express();

  if (!isProduction) {
    const { createServer } = await import("vite");

    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "custom"
    });

    app.use(async (req, res, next) => {
      if (!req.headers.accept?.includes("text/html")) {
        return next();
      }

      try {
        const url = req.originalUrl;
        let template = await fs.readFile(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);

        const { render } = await vite.ssrLoadModule("/src/entry-server.ts");
        const { appHtml, headTags, htmlAttrs, bodyAttrs, bodyTags, bodyTagsOpen, siteContentJson } = await render(url);
        const html = renderDocument(template, appHtml, { headTags, htmlAttrs, bodyAttrs, bodyTags, bodyTagsOpen }, siteContentJson);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error);
        next(error);
      }
    });

    app.use(vite.middlewares);
  } else {
    const template = await fs.readFile(path.resolve(__dirname, "dist/client/index.html"), "utf-8");
    const { render } = await import("./dist/server/entry-server.js");

    app.use("/assets", express.static(path.resolve(__dirname, "dist/client/assets"), { immutable: true, maxAge: "1y" }));
    app.use(express.static(path.resolve(__dirname, "dist/client"), { index: false }));

    app.use("*", async (req, res) => {
      const url = req.originalUrl;
      const { appHtml, headTags, htmlAttrs, bodyAttrs, bodyTags, bodyTagsOpen, siteContentJson } = await render(url);
      const html = renderDocument(template, appHtml, { headTags, htmlAttrs, bodyAttrs, bodyTags, bodyTagsOpen }, siteContentJson);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    });
  }

  app.listen(port, () => {
    console.log(`SSR server running on http://localhost:${port}`);
  });
};

start();
