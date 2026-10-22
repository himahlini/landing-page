import { createApp, createSSRApp } from "vue";
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

// Admin routes are never prerendered, so the fallback HTML belongs to the home page.
// Hydrating over it leaves the home page's classes behind, so render the admin from scratch.
const isAdminRoute = window.location.pathname.startsWith("/admin");
const rootElement = document.getElementById("root");

if (isAdminRoute && rootElement) {
  rootElement.innerHTML = "";
}

const app = isAdminRoute ? createApp(App) : createSSRApp(App);
const router = createAppRouter(false);
const head = createHead();

app.provide(siteContentKey, normalizeSiteContent(window.__INITIAL_SITE_CONTENT__ ?? defaultSiteContent));
app.use(router);
app.use(head);
router.isReady().then(() => {
  app.mount("#root");
});
