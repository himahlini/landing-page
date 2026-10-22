<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { AlertTriangle, Check, CheckCircle2, ExternalLink, Loader2, RotateCcw, X } from "lucide-vue-next";

import type { DeployJob } from "../api";
import { formatDuration, formatRelativeTime } from "../time";

const props = defineProps<{
  job: DeployJob;
  liveUrl: string;
  canRetry: boolean;
}>();

defineEmits<{
  retry: [];
  dismiss: [];
}>();

const now = ref(Date.now());
let ticker: number | undefined;

onMounted(() => {
  ticker = window.setInterval(() => (now.value = Date.now()), 1000);
});
onBeforeUnmount(() => window.clearInterval(ticker));

const isRunning = computed(() => props.job.status === "running" || props.job.status === "queued");
const elapsed = computed(() => formatDuration(now.value - new Date(props.job.created_at).getTime()));
const finishedAgo = computed(() =>
  props.job.completed_at ? formatRelativeTime(new Date(props.job.completed_at), new Date(now.value)) : ""
);

const steps = [
  { id: "saved", label: "Changes saved" },
  { id: "preparing", label: "Getting ready" },
  { id: "building", label: "Building the website" },
  { id: "live", label: "Live" }
];

const activeStep = computed(() => {
  if (props.job.stage === "success") return 4;
  if (props.job.stage === "building") return 2;
  return 1;
});
</script>

<template>
  <section
    class="rounded-2xl border p-4 sm:p-5"
    :class="{
      'border-sky-200 bg-sky-50/70': isRunning,
      'border-emerald-200 bg-emerald-50/70': job.status === 'success',
      'border-rose-200 bg-rose-50/70': job.status === 'failed'
    }"
    aria-live="polite"
  >
    <template v-if="isRunning">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 class="flex items-center gap-2 text-[15px] font-semibold">
            <Loader2 :size="18" class="animate-spin text-sky-700" />
            Publishing your changes…
          </h2>
          <p class="mt-1 text-sm text-stone-600">
            This usually takes 2–4 minutes. You can keep editing or close this page — publishing carries on.
          </p>
        </div>
        <span class="rounded-full bg-white px-2.5 py-1 text-xs font-medium tabular-nums text-sky-800">{{ elapsed }}</span>
      </div>

      <ol class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        <li v-for="(step, index) in steps" :key="step.id" class="flex items-center gap-2 text-sm">
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs"
            :class="
              index < activeStep
                ? 'border-sky-700 bg-sky-700 text-white'
                : index === activeStep
                  ? 'border-sky-700 bg-white text-sky-700'
                  : 'border-stone-300 bg-white text-stone-400'
            "
          >
            <Check v-if="index < activeStep" :size="14" />
            <Loader2 v-else-if="index === activeStep" :size="14" class="animate-spin" />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span :class="index <= activeStep ? 'text-stone-900' : 'text-stone-400'">{{ step.label }}</span>
        </li>
      </ol>
    </template>

    <div v-else-if="job.status === 'success'" class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-start gap-3">
        <CheckCircle2 :size="22" class="mt-0.5 shrink-0 text-emerald-600" />
        <div>
          <h2 class="text-[15px] font-semibold">Your changes are live</h2>
          <p class="text-sm text-stone-600">Published {{ finishedAgo }}. It can take a minute for every visitor to see the update.</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <a :href="liveUrl" target="_blank" rel="noopener" class="admin-btn-secondary">
          <ExternalLink :size="16" />
          View website
        </a>
        <button type="button" class="admin-icon-btn" aria-label="Dismiss" @click="$emit('dismiss')">
          <X :size="16" />
        </button>
      </div>
    </div>

    <div v-else class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <AlertTriangle :size="22" class="mt-0.5 shrink-0 text-rose-600" />
        <div>
          <h2 class="text-[15px] font-semibold">Publishing didn't finish</h2>
          <p class="text-sm text-stone-600">
            Your changes are saved, but the website wasn't updated. Please try again. If it keeps happening, contact your website developer.
          </p>
          <details v-if="job.message || job.run_url" class="mt-2 text-xs text-stone-500">
            <summary class="cursor-pointer select-none">Technical details for your developer</summary>
            <p class="mt-1 break-words font-mono">{{ job.message }}</p>
            <a v-if="job.run_url" :href="job.run_url" target="_blank" rel="noopener" class="mt-1 inline-block underline">View build log</a>
          </details>
        </div>
      </div>
      <button v-if="canRetry" type="button" class="admin-btn-primary" @click="$emit('retry')">
        <RotateCcw :size="16" />
        Try again
      </button>
    </div>
  </section>
</template>
