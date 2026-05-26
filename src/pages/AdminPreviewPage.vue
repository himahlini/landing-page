<script setup lang="ts">
import { onMounted, provide, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { ArrowLeft, Loader2 } from "lucide-vue-next";

import { defaultSiteContent, type SiteContent } from "../content/site-content";
import { siteContentKey } from "../content/site-content-key";
import HomePage from "./HomePage.vue";

const content = reactive(structuredClone(defaultSiteContent)) as SiteContent;
const loading = ref(true);
const error = ref("");

provide(siteContentKey, content);

const loadDraft = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/content/preview", {
      credentials: "include"
    });
    const body = await response.json() as { content?: SiteContent; error?: string };

    if (!response.ok || !body.content) {
      throw new Error(body.error ?? "Unable to load draft preview.");
    }

    Object.assign(content, structuredClone(body.content));
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to load draft preview.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadDraft);
</script>

<template>
  <div class="min-h-screen bg-bg">
    <div class="sticky top-0 z-50 border-b border-border bg-bg/95 px-6 py-4 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <RouterLink to="/admin" class="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-primary">
          <ArrowLeft :size="16" />
          Back to editor
        </RouterLink>
        <span class="font-sans text-xs uppercase tracking-widest text-accent">Draft Preview</span>
      </div>
    </div>

    <div v-if="loading" class="grid min-h-[60vh] place-items-center text-primary">
      <Loader2 class="animate-spin" :size="28" />
    </div>
    <div v-else-if="error" class="mx-auto max-w-2xl px-6 py-24 font-sans text-primary">
      {{ error }}
    </div>
    <HomePage v-else />
  </div>
</template>
