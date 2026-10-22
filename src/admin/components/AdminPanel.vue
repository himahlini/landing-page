<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <section class="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)] sm:p-6">
    <header class="mb-5">
      <h2 class="text-base font-semibold">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-sm text-stone-500">{{ description }}</p>
    </header>
    <div class="grid grid-cols-1 gap-5">
      <slot />
    </div>
  </section>
</template>
