<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ChevronRight } from "lucide-vue-next";

import { useSiteContent } from "../content/use-site-content";

const content = useSiteContent();
</script>

<template>
  <div>
    <section class="relative min-h-[100svh] overflow-hidden bg-bg scroll-mt-28 md:scroll-mt-32 lg:scroll-mt-36">
      <div class="relative z-10 mx-auto grid min-h-[100svh] max-w-[1560px] lg:grid-cols-[minmax(0,1fr)_clamp(460px,34vw,680px)]">
        <div class="flex items-center px-8 pt-48 pb-32 lg:py-32 lg:pl-12 lg:pr-8">
          <div class="max-w-4xl">
            <div class="mb-12">
              <span class="font-sans text-xs tracking-[0.4em] uppercase text-accent mb-8 block">{{ content.hero.label }}</span>
              <h1 class="text-3xl sm:text-4xl md:text-4xl lg:text-5xl leading-[1.1] font-normal">
                <span class="font-medium">{{ content.hero.title.primary }}</span>
                <br />
                <span class="font-medium not-italic">{{ content.hero.title.secondary }}</span>
              </h1>
            </div>
            <p class="font-sans text-base md:text-xl text-primary leading-relaxed max-w-xl mb-16 font-normal">
              {{ content.hero.description }}
            </p>

            <div class="flex flex-col sm:flex-row gap-6">
              <RouterLink
                :to="{ path: '/', hash: '#contact' }"
                class="bg-primary text-bg px-12 py-5 font-sans text-md transition-opacity hover:opacity-90 inline-flex items-center gap-4"
              >
                <span>{{ content.hero.cta.label }}</span>
                <ChevronRight :size="16" :stroke-width="1.8" />
              </RouterLink>
            </div>
          </div>
        </div>
        <div class="pointer-events-none hidden lg:block grayscale overflow-hidden">
          <div class="relative h-full w-full">
            <div class="absolute inset-0 bg-bg/35 z-10" />
            <img
              :src="content.hero.image.src"
              :alt="content.hero.image.alt"
              class="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </div>

      <div class="absolute bottom-12 left-1/2 hidden -translate-x-1/2 md:left-24 md:block md:translate-x-0">
        <div class="w-px h-16 bg-border" />
      </div>
    </section>

    <section id="services" class="bg-bg border-t mx-auto max-w-7xl border-border scroll-mt-28 md:scroll-mt-32 lg:scroll-mt-36">
      <div class="border-b border-border">
        <div class="max-w-7xl mx-auto px-8 lg:px-12 py-8 md:py-16">
          <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-10 lg:gap-16 items-end max-w-6xl">
            <div>
              <div class="h-px w-16 bg-primary mb-6" />
              <h2 class="text-2xl sm:text-4xl md:text-4xl lg:text-5xl font-serif leading-[1.05] tracking-tight">
                {{ content.practiceOverview.label }}
              </h2>
            </div>
            <p class="font-sans text-sm md:text-base lg:text-lg leading-relaxed text-primary max-w-2xl">
              {{ content.practiceOverview.description }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="(practice, idx) in content.practiceAreas"
          :key="practice.slug"
          :to="`/practice/${practice.slug}`"
          :class="[
            'p-6 sm:p-8 lg:p-12 flex flex-col justify-between border-b border-border group bg-surface/80 hover:bg-surface transition-all duration-500 min-h-[180px] sm:min-h-[250px] relative',
            idx % 2 === 0 ? 'md:border-r' : '',
            idx % 3 !== 2 ? 'lg:border-r' : 'lg:border-r-0'
          ]"
        >
          <div class="flex justify-between items-start mb-6 sm:mb-12">
            <span class="text-xs font-sans tracking-[0.3em] uppercase text-accent">{{ practice.id }}</span>
            <ChevronRight
              :size="14"
              class="text-border group-hover:text-primary transition-colors transform group-hover:translate-x-1"
            />
          </div>
          <div>
            <h3 class="text-xl sm:text-2xl font-serif mb-3 sm:mb-4 transition-colors group-hover:text-title">
              {{ practice.title }}
            </h3>
            <p class="font-sans text-sm text-primary leading-snug sm:leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
              {{ practice.description }}
            </p>
          </div>
          <div class="mt-6 sm:mt-8 overflow-hidden h-px bg-border group-hover:bg-primary transition-colors" />
        </RouterLink>
      </div>
    </section>

    <section id="contact" class="py-24 md:py-28 lg:py-32 bg-bg border-t border-border scroll-mt-28 md:scroll-mt-32 lg:scroll-mt-36">
      <div class="max-w-7xl mx-auto px-8 lg:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-16 lg:gap-24 items-start">
          <div>
            <div class="mb-8 md:mb-10">
              <h2 class="text-2xl md:text-4xl lg:text-5xl leading-[1.1] font-serif">
                {{ content.contact.label }}
              </h2>
            </div>

            <div class="space-y-10">
              <div class="flex flex-col gap-4">
                <span class="font-sans text-xs tracking-wider uppercase text-accent font-semibold">
                  {{ content.contact.office.label }}
                </span>
                <p class="font-sans text-base text-primary leading-relaxed max-w-md">
                  {{ content.contact.office.address }}
                </p>
              </div>

              <div class="flex flex-col gap-4">
                <span class="font-sans text-xs tracking-wider uppercase text-accent font-semibold">
                  {{ content.contact.communication.label }}
                </span>
                <div class="font-sans text-base text-primary space-y-1">
                  <p>{{ content.contact.communication.phone }}</p>
                  <a
                    :href="`mailto:${content.contact.communication.email}`"
                    class="hover:text-title transition-colors"
                  >
                    {{ content.contact.communication.email }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-8">
            <div class="aspect-[16/11] lg:aspect-[16/10] w-full overflow-hidden border border-border bg-surface">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.7373713690267!2d101.6577124!3d3.1637482999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc48f71baeb3c1%3A0x56d42f49d6edb996!2sHimahlini%20%26%20Co!5e0!3m2!1sen!2smy!4v1779281532676!5m2!1sen!2smy"
                class="w-full h-full"
                style="border:0;"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
