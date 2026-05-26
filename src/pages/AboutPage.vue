<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ChevronRight } from "lucide-vue-next";

import { useSiteContent } from "../content/use-site-content";
import PeopleProfileRow from "../components/PeopleProfileRow.vue";

const content = useSiteContent();
const featuredMember = content.people.members[0];
const supportingMembers = content.people.members.slice(1);
</script>

<template>
  <div class="bg-bg min-h-screen">
    <section id="about" class="pt-40 pb-24 md:pt-44 md:pb-28 lg:pt-48 lg:pb-32 bg-bg scroll-mt-36 md:scroll-mt-40 lg:scroll-mt-44">
      <div class="max-w-7xl mx-auto px-8 lg:px-12">
        <div class="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          <div class="lg:w-1/2">
            <div class="mb-8 md:mb-10">
              <span class="font-sans text-xs tracking-[0.4em] uppercase text-accent mb-8 block">{{ content.about.label }}</span>
              <h1 class="text-3xl sm:text-4xl md:text-4xl lg:text-5xl leading-[1.1] font-serif text-title">
                {{ content.about.titleLines[0] }} <br />
                {{ content.about.titleLines[1] }}
              </h1>
            </div>
            <div class="space-y-6 text-primary font-normal leading-relaxed font-sans text-sm max-w-md">
              <p v-for="paragraph in content.about.description" :key="paragraph">
                {{ paragraph }}
              </p>
            </div>
          </div>

          <div class="lg:w-1/2 w-full">
            <div class="aspect-[3/4] relative grayscale hover:grayscale-0 transition-all duration-1000">
              <img
                :src="content.about.image.src"
                :alt="content.about.image.alt"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 border border-border m-6" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="people" class="py-20 md:py-24 lg:py-28 bg-bg text-primary scroll-mt-28 md:scroll-mt-32 lg:scroll-mt-36">
      <div class="max-w-7xl mx-auto px-8 lg:px-12">
        <div class="max-w-3xl mx-auto text-center mb-14 md:mb-16">
          <span class="font-sans text-xs tracking-[0.45em] uppercase text-accent mb-6 block">
            {{ content.people.label }}
          </span>
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] font-serif text-title">
            {{ content.people.title }}
          </h2>
          <p class="mt-6 font-sans text-sm md:text-base leading-relaxed text-primary max-w-2xl mx-auto">
            {{ content.people.description }}
          </p>
        </div>

        <div class="mt-4">
          <div class="grid grid-cols-1 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] gap-10 lg:gap-14 items-center">
            <div class="relative">
              <div class="aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-surface">
                <img
                  :src="featuredMember.image"
                  :alt="featuredMember.name"
                  class="w-full h-full object-cover object-top"
                />
              </div>
              <div class="absolute inset-0 rounded-[1.75rem] pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            <div class="lg:pl-6">
              <span class="font-sans text-xs tracking-[0.4em] uppercase text-accent mb-5 block">
                {{ featuredMember.role }}
              </span>
              <h3 class="font-serif text-3xl md:text-4xl lg:text-5xl leading-[1.05]">
                {{ featuredMember.name }}
              </h3>
              <div class="mt-5 text-sm md:text-base uppercase tracking-[0.28em] text-accent font-medium">
                {{ featuredMember.credentials }}
              </div>
              <div class="mt-8 space-y-6 font-sans text-sm md:text-base leading-relaxed text-primary max-w-2xl">
                <p>{{ featuredMember.bio }}</p>
                <p>{{ content.people.description }}</p>
              </div>

              <RouterLink
                to="/#contact"
                class="mt-10 inline-flex items-center gap-4 rounded-full border border-brand/35 bg-brand px-6 py-3 font-sans text-xs tracking-[0.22em] uppercase text-bg transition-transform hover:translate-y-[-1px] hover:bg-brand-soft"
              >
                {{ content.detailPage.ctaLabel }}
                <ChevronRight :size="16" :stroke-width="1.8" />
              </RouterLink>
            </div>
          </div>

          <div class="mt-10 border-t border-border pt-10 space-y-8 md:space-y-10">
            <PeopleProfileRow
              v-for="(member, index) in supportingMembers"
              :key="member.name"
              :member="member"
              :reverse="index % 2 === 1"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
