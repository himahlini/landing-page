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

  if (hash) {
    return currentPath === path && currentHash === hash;
  }

  return currentPath === path && currentHash === "";
};

const navLinkClass = (href: string, options?: { mobile?: boolean }) =>
  [
    "transition-colors font-medium",
    options?.mobile ? "inline-flex self-start flex-col gap-3 pb-0" : "",
    isActiveLink(href)
      ? options?.mobile
        ? "text-primary after:block after:h-px after:w-8 after:bg-primary after:content-['']"
        : "text-primary border-b border-primary pb-1"
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
          :class="navLinkClass(item.href, { mobile: true })"
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

    <footer v-if="!isAdminRoute" class="bg-bg border-t border-border py-12 px-6 sm:px-8 lg:px-12">
      <div class="max-w-7xl mx-auto flex items-start justify-between gap-6 font-sans text-[10px] uppercase text-accent sm:text-[11px] sm:tracking-[0.24em]">
        <div class="flex min-w-0 items-start gap-4 sm:gap-6">
          <div class="flex min-w-0 flex-col text-primary">
            <span class="whitespace-nowrap font-sans text-[0.82rem] leading-none tracking-[0.18em] font-light uppercase sm:text-[1rem] sm:tracking-[0.24em]">
              {{ brandTitle }}
            </span>
            <span class="mt-2 whitespace-nowrap font-sans text-[0.45rem] leading-none tracking-[0.1em] text-primary/90 sm:text-[0.62rem] sm:tracking-[0.14em]">
              {{ brandSubtitle }}
            </span>
          </div>
          <span class="shrink-0 pt-1 text-[0.72rem] tracking-[0.22em] text-primary/60 sm:text-[0.85rem] sm:tracking-[0.3em]">
            {{ content.footer.copyright.replace("CURRENT_YEAR", String(new Date().getFullYear())) }}
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>
