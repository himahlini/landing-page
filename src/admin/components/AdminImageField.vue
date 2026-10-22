<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { AlertCircle, ImageOff, ImagePlus, Loader2, RefreshCw } from "lucide-vue-next";

import { api, errorMessage, isUnauthorized, uploadToSignedUrl } from "../api";
import { showToast } from "../feedback";
import { useAdminForm, useUnpublishedCheck } from "../form-context";

const props = defineProps<{
  label: string;
  path?: string;
  hint?: string;
  aspect?: "landscape" | "portrait";
}>();

const src = defineModel<string>({ required: true });

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const maxBytes = 5 * 1024 * 1024;

const { errors, showAllErrors, uploadsInFlight, onUnauthorized } = useAdminForm();
const id = useId();
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const progress = ref(0);
const uploadError = ref("");
const dragging = ref(false);
const previewFailed = ref(false);
const isChanged = useUnpublishedCheck();
const isUnpublished = computed(() => isChanged(props.path));

const validationError = computed(() => (props.path && showAllErrors.value ? errors.value[props.path] : undefined));
const visibleError = computed(() => uploadError.value || validationError.value);

watch(src, () => {
  previewFailed.value = false;
});

const checkFile = (file: File) => {
  if (!allowedTypes.includes(file.type)) {
    return "Please choose a JPG, PNG, WebP, GIF or SVG image.";
  }
  if (file.size > maxBytes) {
    return `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please use one that's 5MB or smaller.`;
  }
  return "";
};

const upload = async (file: File) => {
  uploadError.value = checkFile(file);
  if (uploadError.value) return;

  uploading.value = true;
  uploadsInFlight.value += 1;
  progress.value = 0;

  try {
    const session = await api.requestUpload(file);
    await uploadToSignedUrl(file, session, (percent) => (progress.value = percent));
    src.value = session.url;
    showToast("success", "Image uploaded", "It will appear on the website after you publish.");
  } catch (error) {
    if (isUnauthorized(error)) onUnauthorized();
    uploadError.value = errorMessage(error, "The image couldn't be uploaded. Please try again.");
  } finally {
    uploading.value = false;
    uploadsInFlight.value -= 1;
    if (fileInput.value) fileInput.value.value = "";
  }
};

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) void upload(file);
};

const onDrop = (event: DragEvent) => {
  dragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file && !uploading.value) void upload(file);
};
</script>

<template>
  <div class="grid content-start gap-1.5" :data-field-path="path">
    <span class="flex items-baseline gap-2">
      <span :id="`${id}-label`" class="text-sm font-medium text-stone-800">{{ label }}</span>
      <span v-if="isUnpublished" class="inline-flex items-center gap-1 text-xs font-medium text-amber-700" title="Edited — not live yet">
        <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Edited
      </span>
    </span>

    <div
      class="flex flex-col gap-4 rounded-lg border border-dashed p-3 transition sm:flex-row sm:items-center"
      :class="[
        dragging ? 'border-stone-600 bg-stone-100' : visibleError ? 'border-rose-400 bg-rose-50/40' : 'border-stone-300 bg-stone-50/60'
      ]"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <div
        class="relative shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100"
        :class="aspect === 'portrait' ? 'h-36 w-28' : 'h-28 w-full sm:w-48'"
      >
        <img
          v-if="src && !previewFailed"
          :src="src"
          :alt="`Current ${label.toLowerCase()}`"
          class="h-full w-full object-cover"
          @error="previewFailed = true"
        />
        <div v-else class="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-xs text-stone-500">
          <ImageOff :size="20" />
          {{ src ? "Image can't be shown" : "No image yet" }}
        </div>
        <div v-if="uploading" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 text-xs font-medium text-stone-700">
          <Loader2 class="animate-spin" :size="18" />
          {{ progress }}%
        </div>
      </div>

      <div class="grid min-w-0 gap-2">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="admin-btn-secondary"
            :disabled="uploading"
            :aria-describedby="`${id}-label`"
            @click="fileInput?.click()"
          >
            <Loader2 v-if="uploading" class="animate-spin" :size="16" />
            <RefreshCw v-else-if="src" :size="16" />
            <ImagePlus v-else :size="16" />
            {{ uploading ? "Uploading…" : src ? "Replace image" : "Upload image" }}
          </button>
        </div>
        <p class="text-sm text-stone-500">
          {{ hint ?? "Drag an image here or click the button." }} JPG, PNG or WebP, up to 5MB.
        </p>
        <div v-if="uploading" class="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-stone-200">
          <div class="h-full bg-stone-800 transition-[width]" :style="{ width: `${progress}%` }" />
        </div>
      </div>

      <input ref="fileInput" type="file" :accept="allowedTypes.join(',')" class="sr-only" tabindex="-1" @change="onFileChange" />
    </div>

    <p v-if="visibleError" class="flex items-center gap-1.5 text-sm text-rose-700" role="alert">
      <AlertCircle :size="14" class="shrink-0" />
      {{ visibleError }}
    </p>
  </div>
</template>
