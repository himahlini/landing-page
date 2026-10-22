<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

import { confirmState, settleConfirm } from "../feedback";

const confirmButton = ref<HTMLButtonElement | null>(null);
let returnFocusTo: HTMLElement | null = null;

watch(
  () => confirmState.options,
  async (options) => {
    if (options) {
      returnFocusTo = document.activeElement as HTMLElement | null;
      await nextTick();
      confirmButton.value?.focus();
    } else {
      returnFocusTo?.focus();
    }
  }
);
</script>

<template>
  <Transition
    enter-active-class="transition duration-150"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="confirmState.options"
      class="fixed inset-0 z-[70] flex items-end justify-center bg-stone-900/40 p-4 sm:items-center"
      @click.self="settleConfirm(false)"
      @keydown.esc="settleConfirm(false)"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="admin-confirm-title" class="text-lg font-semibold">{{ confirmState.options.title }}</h2>
        <p v-if="confirmState.options.body" class="mt-2 text-[15px] leading-relaxed text-stone-600">
          {{ confirmState.options.body }}
        </p>
        <ul v-if="confirmState.options.items?.length" class="mt-4 grid gap-1.5 rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
          <li v-for="item in confirmState.options.items" :key="item" class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {{ item }}
          </li>
        </ul>
        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="admin-btn-secondary" @click="settleConfirm(false)">Cancel</button>
          <button
            ref="confirmButton"
            type="button"
            class="admin-btn-primary"
            :class="confirmState.options.tone === 'danger' ? 'admin-btn-danger' : ''"
            @click="settleConfirm(true)"
          >
            {{ confirmState.options.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
