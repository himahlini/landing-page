<script setup lang="ts">
import { watch } from "vue";
import { ArrowDown, ArrowUp, ChevronDown, Trash2 } from "lucide-vue-next";

import { useAdminForm } from "../form-context";

const props = defineProps<{
  title: string;
  subtitle?: string;
  index: number;
  total: number;
  errorCount?: number;
  unpublished?: boolean;
}>();

const open = defineModel<boolean>("open", { default: false });
const { showAllErrors } = useAdminForm();

// Expand cards with problems once the user tries to publish, so the highlighted fields are visible.
watch(
  () => showAllErrors.value && Boolean(props.errorCount),
  (shouldOpen) => {
    if (shouldOpen) open.value = true;
  },
  { immediate: true }
);

defineEmits<{
  moveUp: [];
  moveDown: [];
  remove: [];
}>();
</script>

<template>
  <div class="rounded-xl border bg-white transition" :class="errorCount ? 'border-rose-300' : 'border-stone-200'">
    <div class="flex items-center gap-2 p-2 pl-3">
      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1.5 text-left"
        :aria-expanded="open"
        @click="open = !open"
      >
        <ChevronDown :size="18" class="shrink-0 text-stone-400 transition" :class="open ? 'rotate-180' : ''" />
        <span class="min-w-0">
          <span class="block truncate text-[15px] font-medium text-stone-900">{{ title || "Untitled" }}</span>
          <span v-if="subtitle" class="block truncate text-sm text-stone-500">{{ subtitle }}</span>
        </span>
        <span v-if="unpublished && !errorCount" class="ml-auto flex shrink-0 items-center gap-1 text-xs font-medium text-amber-700" title="Edited — not live yet">
          <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Edited
        </span>
        <span v-if="errorCount" class="ml-auto shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
          {{ errorCount }} to fix
        </span>
      </button>

      <div class="flex shrink-0 items-center">
        <button type="button" class="admin-icon-btn" :disabled="index === 0" :aria-label="`Move ${title} up`" title="Move up" @click="$emit('moveUp')">
          <ArrowUp :size="16" />
        </button>
        <button
          type="button"
          class="admin-icon-btn"
          :disabled="index === total - 1"
          :aria-label="`Move ${title} down`"
          title="Move down"
          @click="$emit('moveDown')"
        >
          <ArrowDown :size="16" />
        </button>
        <button type="button" class="admin-icon-btn hover:!bg-rose-50 hover:!text-rose-700" :aria-label="`Remove ${title}`" title="Remove" @click="$emit('remove')">
          <Trash2 :size="16" />
        </button>
      </div>
    </div>

    <div v-if="open" class="grid grid-cols-1 gap-5 border-t border-stone-100 p-4 sm:p-5">
      <slot />
    </div>
  </div>
</template>
