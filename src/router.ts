import { createRouter, createWebHistory, createMemoryHistory, type RouterHistory, type RouteRecordRaw } from "vue-router";

import AboutPage from "./pages/AboutPage.vue";
import AdminPage from "./pages/AdminPage.vue";
import AdminPreviewPage from "./pages/AdminPreviewPage.vue";
import HomePage from "./pages/HomePage.vue";
import PracticeDetailPage from "./pages/PracticeDetailPage.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomePage
  },
  {
    path: "/practice/:slug",
    name: "practice-detail",
    component: PracticeDetailPage
  },
  {
    path: "/about",
    name: "about",
    component: AboutPage
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminPage
  },
  {
    path: "/admin/preview",
    name: "admin-preview",
    component: AdminPreviewPage
  }
];

export const createAppRouter = (isServer = false) => {
  const history: RouterHistory = isServer ? createMemoryHistory() : createWebHistory();

  const router = createRouter({
    history,
    routes,
    scrollBehavior(to) {
      if (to.hash) {
        return {
          el: to.hash,
          behavior: "smooth"
        };
      }

      return { top: 0, left: 0 };
    }
  });

  return router;
};
