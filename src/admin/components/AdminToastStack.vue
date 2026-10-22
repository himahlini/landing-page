<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info, X } from "lucide-vue-next";

import { dismissToast, toasts } from "../feedback";

const toneClass = {
  success: "text-emerald-600",
  error: "text-rose-600",
  info: "text-stone-500"
};
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-16 z-[80] lg:bottom-0 flex flex-col items-center gap-2 p-4 sm:items-end" aria-live="polite">
    <TransitionGroup
      enter-active-class="transition duration-200"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-lg"
        :role="toast.tone === 'error' ? 'alert' : 'status'"
      >
        <CheckCircle2 v-if="toast.tone === 'success'" :size="20" class="mt-0.5 shrink-0" :class="toneClass.success" />
        <AlertCircle v-else-if="toast.tone === 'error'" :size="20" class="mt-0.5 shrink-0" :class="toneClass.error" />
        <Info v-else :size="20" class="mt-0.5 shrink-0" :class="toneClass.info" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-stone-900">{{ toast.title }}</p>
          <p v-if="toast.body" class="mt-0.5 text-sm text-stone-600">{{ toast.body }}</p>
        </div>
        <button type="button" class="-m-1 rounded p-1 text-stone-400 hover:text-stone-700" aria-label="Dismiss" @click="dismissToast(toast.id)">
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
