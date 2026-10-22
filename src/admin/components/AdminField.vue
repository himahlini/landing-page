<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { AlertCircle } from "lucide-vue-next";

import { useAdminForm, useUnpublishedCheck } from "../form-context";

const props = withDefaults(
  defineProps<{
    label: string;
    path?: string;
    hint?: string;
    multiline?: boolean;
    rows?: number;
    type?: "text" | "email" | "tel" | "number" | "url";
    placeholder?: string;
    prefix?: string;
    required?: boolean;
    recommendedLength?: number;
    lengthNote?: string;
  }>(),
  { rows: 3, type: "text" }
);

const model = defineModel<string | number>({ required: true });

const { errors, showAllErrors } = useAdminForm();
const id = useId();
const touched = ref(false);
const isChanged = useUnpublishedCheck();
const isUnpublished = computed(() => isChanged(props.path));

const error = computed(() => (props.path ? errors.value[props.path] : undefined));
const visibleError = computed(() => (touched.value || showAllErrors.value ? error.value : undefined));
const length = computed(() => String(model.value ?? "").length);
const isOverRecommended = computed(() => Boolean(props.recommendedLength && length.value > props.recommendedLength));
const describedBy = computed(() => [props.hint ? `${id}-hint` : "", visibleError.value ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined);

const update = (event: Event) => {
  const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  model.value = props.type === "number" ? Number(value) : value;
};
</script>

<template>
  <div class="grid content-start gap-1.5" :data-field-path="path">
    <div class="flex items-baseline justify-between gap-3">
      <span class="flex min-w-0 items-baseline gap-2">
        <label :for="id" class="text-sm font-medium text-stone-800">
          {{ label }}
          <span v-if="required" class="text-rose-700" aria-hidden="true">*</span>
        </label>
        <span v-if="isUnpublished" class="inline-flex items-center gap-1 text-xs font-medium text-amber-700" title="Edited — not live yet">
          <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Edited
        </span>
      </span>
      <span
        v-if="recommendedLength"
        class="text-xs tabular-nums"
        :class="isOverRecommended ? 'text-amber-700' : 'text-stone-400'"
      >
        {{ length }} / {{ recommendedLength }}
      </span>
    </div>

    <div
      class="admin-input-wrap flex items-stretch rounded-lg border bg-white transition focus-within:ring-2"
      :class="visibleError ? 'border-rose-400 focus-within:ring-rose-200' : 'border-stone-300 focus-within:border-stone-500 focus-within:ring-stone-200'"
    >
      <span v-if="prefix" class="flex items-center rounded-l-lg border-r border-stone-200 bg-stone-50 px-3 text-sm text-stone-500">
        {{ prefix }}
      </span>
      <textarea
        v-if="multiline"
        :id="id"
        :value="model"
        :rows="rows"
        :placeholder="placeholder"
        :aria-invalid="Boolean(visibleError)"
        :aria-describedby="describedBy"
        class="block w-full resize-y rounded-lg bg-transparent px-3.5 py-2.5 text-[15px] leading-relaxed text-stone-900 outline-none placeholder:text-stone-400"
        @input="update"
        @blur="touched = true"
      />
      <input
        v-else
        :id="id"
        :value="model"
        :type="type"
        :placeholder="placeholder"
        :aria-invalid="Boolean(visibleError)"
        :aria-describedby="describedBy"
        class="block w-full min-w-0 rounded-lg bg-transparent px-3.5 py-2.5 text-[15px] text-stone-900 outline-none placeholder:text-stone-400"
        @input="update"
        @blur="touched = true"
      />
    </div>

    <p v-if="visibleError" :id="`${id}-error`" class="flex items-center gap-1.5 text-sm text-rose-700" role="alert">
      <AlertCircle :size="14" class="shrink-0" />
      {{ visibleError }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="text-sm text-stone-500">{{ hint }}</p>
    <p v-if="isOverRecommended && !visibleError" class="text-xs text-amber-700">
      {{ lengthNote ?? "This is longer than recommended and may look crowded on phones." }}
    </p>
  </div>
</template>
