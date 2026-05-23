import { createSSRApp } from "vue";

import App from "./App.vue";
import { createAppRouter } from "./router";

const app = createSSRApp(App);
const router = createAppRouter(false);

app.use(router);
router.isReady().then(() => {
  app.mount("#root");
});
