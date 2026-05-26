import { createSSRApp } from "vue";
import { createHead } from "@unhead/vue/client";

import App from "./App.vue";
import { defaultSiteContent, normalizeSiteContent } from "./content/site-content";
import { siteContentKey } from "./content/site-content-key";
import { createAppRouter } from "./router";

declare global {
  interface Window {
    __INITIAL_SITE_CONTENT__?: typeof defaultSiteContent;
  }
}

const app = createSSRApp(App);
const router = createAppRouter(false);
const head = createHead();

app.provide(siteContentKey, normalizeSiteContent(window.__INITIAL_SITE_CONTENT__ ?? defaultSiteContent));
app.use(router);
app.use(head);
router.isReady().then(() => {
  app.mount("#root");
});
