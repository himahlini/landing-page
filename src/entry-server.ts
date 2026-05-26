import { createSSRApp } from "vue";
import { renderToString } from "@vue/server-renderer";
import { createHead, renderSSRHead } from "@unhead/vue/server";

import App from "./App.vue";
import { defaultSiteContent, type SiteContent } from "./content/site-content";
import { siteContentKey } from "./content/site-content-key";
import { createAppRouter } from "./router";

export const render = async (url: string, siteContent: SiteContent = defaultSiteContent) => {
  const pathname = new URL(url, "http://localhost").pathname;
  const app = createSSRApp(App);
  const router = createAppRouter(true);
  const head = createHead();
  app.provide(siteContentKey, siteContent);
  app.use(router);
  app.use(head);
  await router.push(pathname);
  await router.isReady();

  const appHtml = await renderToString(app);
  const { headTags, htmlAttrs, bodyAttrs, bodyTags, bodyTagsOpen } = await renderSSRHead(head);

  return {
    appHtml,
    headTags,
    htmlAttrs,
    bodyAttrs,
    bodyTags,
    bodyTagsOpen,
    siteContentJson: JSON.stringify(siteContent).replace(/</g, "\\u003c")
  };
};
