<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ArrowLeft, ChevronRight } from "lucide-vue-next";

import siteContent from "../content/site-content.json";
import { getPageMeta } from "../lib/seo";

const content = siteContent;
const route = useRoute();

const practice = computed(() =>
  content.practiceAreas.find((item) => item.slug === route.params.slug)
);

const isCurrentPractice = (slug: string) => practice.value?.slug === slug;

watchEffect(() => {
  if (typeof document !== "undefined") {
    document.title = getPageMeta(route.fullPath).title;
  }
});
</script>

<template>
  <div class="pt-40 pb-24 md:pb-28 lg:pb-32 bg-bg min-h-screen">
    <div class="max-w-7xl mx-auto px-8 lg:px-12" v-if="practice">
      <RouterLink to="/" class="inline-flex items-center gap-4 group mb-12 md:mb-16 text-xs font-sans tracking-[0.3em] uppercase text-accent hover:text-primary transition-colors">
        <ArrowLeft :size="16" />
        {{ content.detailPage.backLabel }}
      </RouterLink>

      <div class="grid grid-cols-1 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] gap-12 lg:gap-16">
        <aside class="lg:sticky lg:top-32 self-start">
          <div class="font-serif text-xl md:text-2xl text-title mb-6">
            {{ content.practiceOverview.label }}
          </div>
          <div class="border-t border-border">
            <RouterLink
              v-for="area in content.practiceAreas"
              :key="area.slug"
              :to="`/practice/${area.slug}`"
              :class="[
                'flex items-center gap-4 py-5 border-b border-border transition-colors group',
                isCurrentPractice(area.slug) ? 'text-primary' : 'text-accent hover:text-primary'
              ]"
            >
              <span
                class="font-sans text-xs tracking-[0.25em] uppercase min-w-8 transition-colors"
                :class="isCurrentPractice(area.slug) ? 'text-primary' : 'text-accent'"
              >
                {{ area.id }}
              </span>
              <span
                class="font-serif text-base md:text-lg leading-snug transition-colors"
                :class="isCurrentPractice(area.slug) ? 'text-primary' : 'group-hover:text-primary'"
              >
                {{ area.title }}
              </span>
            </RouterLink>
          </div>
        </aside>

        <div class="min-w-0">
          <div class="mb-10 md:mb-12">
            <span class="font-sans text-xs tracking-[0.4em] uppercase text-accent mb-8 block">
              Expertise — {{ practice.id }}
            </span>
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] font-serif max-w-3xl">
              {{ practice.title }}
            </h1>
          </div>

          <div class="prose prose-sm prose-gray max-w-3xl text-accent font-sans text-base leading-relaxed space-y-8 whitespace-pre-line">
            {{ practice.detailedDescription }}
          </div>

          <div class="mt-14 pt-10 border-t border-border">
            <RouterLink
              to="/#contact"
              class="bg-primary text-bg px-12 py-5 font-sans text-md transition-opacity hover:opacity-90 inline-flex items-center gap-4"
            >
              <span>{{ content.detailPage.ctaLabel }}</span>
              <ChevronRight :size="16" :stroke-width="1.8" />
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-8 lg:px-12 pt-20 text-center font-sans tracking-widest uppercase">
      {{ content.detailPage.notFoundMessage }}
    </div>
  </div>
</template>
