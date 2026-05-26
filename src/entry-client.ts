import { createSSRApp } from "vue";

import App from "./App.vue";
import { defaultSiteContent } from "./content/site-content";
import { siteContentKey } from "./content/site-content-key";
import { createAppRouter } from "./router";

declare global {
  interface Window {
    __INITIAL_SITE_CONTENT__?: typeof defaultSiteContent;
  }
}

const app = createSSRApp(App);
const router = createAppRouter(false);

app.provide(siteContentKey, window.__INITIAL_SITE_CONTENT__ ?? defaultSiteContent);
app.use(router);
router.isReady().then(() => {
  app.mount("#root");
});
