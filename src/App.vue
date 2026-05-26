<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { ChevronRight, Menu, X } from "lucide-vue-next";

import { useSiteContent } from "./content/use-site-content";
import { useRouteSeo } from "./lib/seo";

const content = useSiteContent();
const isOpen = ref(false);
const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith("/admin"));
const brandTitle = computed(() => content.siteMetadata.name.replace(/\s*&\s*/g, " & "));
const brandSubtitle = "Advocates & Solicitors";

useRouteSeo(content);

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
    <nav v-if="!isAdminRoute" class="fixed top-0 left-0 w-full z-50 bg-bg/90 backdrop-blur-sm border-b border-border">
      <div class="max-w-7xl mx-auto px-8 lg:px-12 py-8 flex justify-between items-center">
        <RouterLink to="/" class="group">
          <div class="flex flex-col text-primary transition-opacity group-hover:opacity-70">
            <span class="font-sans text-[1.15rem] leading-none tracking-[0.34em] font-light uppercase sm:text-[1.32rem]">
              {{ brandTitle }}
            </span>
            <span class="mt-2 font-sans text-[0.58rem] leading-none tracking-[0.16em] text-primary/90 sm:text-[0.76rem]">
              {{ brandSubtitle }}
            </span>
          </div>
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

    <footer v-if="!isAdminRoute" class="bg-bg border-t border-border py-12 px-8 lg:px-12">
      <div class="max-w-7xl mx-auto px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8 font-sans text-[11px] tracking-[0.3em] uppercase text-accent">
        <div class="flex items-center gap-8">
          <div class="flex flex-col text-primary">
            <span class="font-sans text-[0.9rem] leading-none tracking-[0.24em] font-light uppercase sm:text-[1rem]">
              {{ brandTitle }}
            </span>
            <span class="mt-2 font-sans text-[0.5rem] leading-none tracking-[0.14em] text-primary/90 sm:text-[0.62rem]">
              {{ brandSubtitle }}
            </span>
          </div>
          <span class="opacity-60 text-primary">
            {{ content.footer.copyright.replace("CURRENT_YEAR", String(new Date().getFullYear())) }}
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>
