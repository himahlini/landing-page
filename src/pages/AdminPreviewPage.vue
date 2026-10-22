<script setup lang="ts">
import { onMounted, provide, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { AlertCircle, ArrowLeft, Eye, Loader2, LogIn, RefreshCw } from "lucide-vue-next";

import "../admin/admin.css";
import { api, errorMessage, isUnauthorized } from "../admin/api";
import { defaultSiteContent, normalizeSiteContent, type SiteContent } from "../content/site-content";
import { siteContentKey } from "../content/site-content-key";
import HomePage from "./HomePage.vue";

const content = reactive(structuredClone(defaultSiteContent)) as SiteContent;
const loading = ref(true);
const refreshing = ref(false);
const error = ref("");
const needsSignIn = ref(false);

provide(siteContentKey, content);

const loadDraft = async ({ refresh = false } = {}) => {
  if (refresh) {
    refreshing.value = true;
  } else {
    loading.value = true;
  }
  error.value = "";
  needsSignIn.value = false;

  try {
    const body = await api.loadDraftPreview();
    Object.assign(content, structuredClone(normalizeSiteContent(body.content)));
  } catch (caught) {
    needsSignIn.value = isUnauthorized(caught);
    error.value = needsSignIn.value
      ? "Please sign in to the website editor to see the preview."
      : errorMessage(caught, "We couldn't load the preview.");
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

onMounted(() => loadDraft());
</script>

<template>
  <div class="min-h-screen bg-bg">
    <div class="admin-root sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-2.5 sm:px-6">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <RouterLink to="/admin" class="admin-btn-ghost !px-2 text-stone-800">
          <ArrowLeft :size="16" />
          <span class="hidden sm:inline">Back to editor</span>
        </RouterLink>
        <p class="flex min-w-0 items-center gap-2 text-sm text-amber-900">
          <Eye :size="16" class="shrink-0" />
          <span class="truncate"><strong class="font-semibold">Preview</strong><span class="hidden sm:inline"> — only you can see this. Publish to make it live.</span></span>
        </p>
        <button type="button" class="admin-btn-ghost !px-2 text-stone-800" :disabled="loading || refreshing" title="Load your latest saved changes" @click="loadDraft({ refresh: true })">
          <RefreshCw :size="16" :class="refreshing ? 'animate-spin' : ''" />
          <span class="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="grid min-h-[60vh] place-items-center text-primary">
      <div class="flex flex-col items-center gap-3 font-sans text-sm text-accent">
        <Loader2 class="animate-spin" :size="28" />
        Loading preview…
      </div>
    </div>
    <div v-else-if="error" class="admin-root grid min-h-[60vh] place-items-center px-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
        <AlertCircle :size="28" class="mx-auto text-rose-500" />
        <p class="mt-3 text-[15px] text-stone-700">{{ error }}</p>
        <RouterLink v-if="needsSignIn" to="/admin" class="admin-btn-primary mt-5">
          <LogIn :size="16" />
          Go to sign in
        </RouterLink>
        <button v-else type="button" class="admin-btn-primary mt-5" @click="loadDraft()">
          <RefreshCw :size="16" />
          Try again
        </button>
      </div>
    </div>
    <HomePage v-else />
  </div>
</template>
