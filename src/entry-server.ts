import { createSSRApp } from "vue";
import { renderToString } from "@vue/server-renderer";

import App from "./App.vue";
import { defaultSiteContent, type SiteContent } from "./content/site-content";
import { siteContentKey } from "./content/site-content-key";
import { getPageMeta } from "./lib/seo";
import { createAppRouter } from "./router";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const render = async (url: string, siteContent: SiteContent = defaultSiteContent) => {
  const pathname = new URL(url, "http://localhost").pathname;
  const app = createSSRApp(App);
  const router = createAppRouter(true);
  app.provide(siteContentKey, siteContent);
  app.use(router);
  await router.push(pathname);
  await router.isReady();

  const meta = getPageMeta(pathname, siteContent);
  const appHtml = await renderToString(app);

  return {
    appHtml,
    title: escapeHtml(meta.title),
    description: escapeHtml(meta.description),
    siteContentJson: JSON.stringify(siteContent).replace(/</g, "\\u003c")
  };
};
