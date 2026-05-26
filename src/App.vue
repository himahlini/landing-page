<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { ChevronRight, Menu, X } from "lucide-vue-next";

import { useSiteContent } from "./content/use-site-content";

const content = useSiteContent();
const isOpen = ref(false);
const route = useRoute();

const isActiveLink = (href: string) => {
  const [path, hash = ""] = href.split("#");
  const currentPath = route.path;
  const currentHash = route.hash.replace("#", "");

  if (path === "/" && hash) {
    return currentPath === "/" && currentHash === hash;
  }

  if (path === "/about" && hash) {
    return currentPath === "/about" && currentHash === hash;
  }

  return route.path === path;
};

const navLinkClass = (href: string) =>
  [
    "transition-colors font-medium",
    isActiveLink(href)
      ? "text-primary border-b border-primary pb-1"
      : "text-accent hover:text-primary"
  ].join(" ");
</script>

<template>
  <div class="min-h-screen bg-bg selection:bg-primary selection:text-bg">
    <nav class="fixed top-0 left-0 w-full z-50 bg-bg/90 backdrop-blur-sm border-b border-border">
      <div class="max-w-7xl mx-auto px-8 lg:px-12 py-8 flex justify-between items-center">
        <RouterLink to="/" class="flex items-center gap-4 group">
          <span class="font-serif text-xl tracking-[0.2em] font-semibold text-primary uppercase transition-opacity group-hover:opacity-70">
            {{ content.siteMetadata.name }}
          </span>
        </RouterLink>

        <div class="hidden md:flex items-center gap-12 font-sans text-xs tracking-[0.3em] uppercase">
          <RouterLink
            v-for="item in content.navigation.items"
            :key="item.label"
            :to="item.href"
            :class="navLinkClass(item.href)"
          >
            {{ item.label }}
          </RouterLink>
        </div>

        <button class="md:hidden text-primary" @click="isOpen = !isOpen">
          <X v-if="isOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>

      <div
        v-if="isOpen"
        class="md:hidden bg-bg border-b border-border px-8 py-12 flex flex-col gap-8 font-sans text-xs tracking-widest uppercase"
      >
        <RouterLink
          v-for="item in content.navigation.items"
          :key="item.label"
          :to="item.href"
          :class="navLinkClass(item.href)"
          @click="isOpen = false"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </nav>

    <main>
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </RouterView>
    </main>

    <footer class="bg-bg border-t border-border py-12 px-8 lg:px-12">
      <div class="max-w-7xl mx-auto px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8 font-sans text-[11px] tracking-[0.3em] uppercase text-accent">
        <div class="flex items-center gap-8">
          <span class="text-primary font-serif text-base tracking-normal normal-case">
            {{ content.footer.brand }}
          </span>
          <span class="opacity-60 text-primary">
            {{ content.footer.copyright.replace("CURRENT_YEAR", String(new Date().getFullYear())) }}
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>
