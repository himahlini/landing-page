<script setup lang="ts">
type Person = {
  name: string;
  role: string;
  credentials: string;
  bio: string;
  image: string;
};

defineProps<{
  member: Person;
  reverse?: boolean;
}>();
</script>

<template>
  <div
    :class="[
      'grid grid-cols-1 lg:items-center gap-6 lg:gap-10',
      reverse ? 'lg:grid-cols-[minmax(260px,0.58fr)_minmax(0,0.82fr)]' : 'lg:grid-cols-[minmax(0,0.82fr)_minmax(260px,0.58fr)]'
    ]"
  >
    <div
      :class="[
        reverse ? 'lg:order-2 lg:pl-6' : 'lg:pr-6'
      ]"
    >
      <span class="font-sans text-xs tracking-[0.4em] uppercase text-accent mb-5 block">
        {{ member.role }}
      </span>
      <h3 class="font-serif text-3xl md:text-4xl leading-[1.05]">
        {{ member.name }}
      </h3>
      <div class="mt-5 text-sm md:text-base uppercase tracking-[0.28em] text-accent font-medium">
        {{ member.credentials }}
      </div>
      <p class="mt-6 font-sans text-sm md:text-base leading-relaxed text-primary max-w-xl">
        {{ member.bio }}
      </p>
    </div>

    <div :class="[reverse ? 'lg:order-1 lg:pr-6' : 'lg:pl-6']">
      <div class="w-full max-w-[380px] aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-surface">
        <img
          :src="member.image"
          :alt="member.name"
          class="w-full h-full object-cover object-top"
        />
      </div>
    </div>
  </div>
</template>
