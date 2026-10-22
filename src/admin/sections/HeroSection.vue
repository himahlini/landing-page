<script setup lang="ts">
import type { SiteContent } from "../../content/site-content";
import AdminField from "../components/AdminField.vue";
import AdminImageField from "../components/AdminImageField.vue";
import AdminPanel from "../components/AdminPanel.vue";

defineProps<{ content: SiteContent }>();
</script>

<template>
  <AdminPanel title="Homepage banner" description="The large section at the very top of the homepage.">
    <AdminField
      v-model="content.hero.label" path="hero.label"
      label="Small label above the headline"
      hint="e.g. Established 1995 • Kuala Lumpur, Malaysia"
    />
    <AdminField v-model="content.hero.title.primary" label="Headline" path="hero.title.primary" :recommended-length="40" required />
    <AdminField
      v-model="content.hero.title.secondary" path="hero.title.secondary"
      label="Second headline line"
      hint="Shown in a lighter style under the headline."
      :recommended-length="40"
    />
    <AdminField v-model="content.hero.description" path="hero.description" label="Introduction" multiline :rows="4" :recommended-length="240" />
  </AdminPanel>

  <AdminPanel title="Button" description="The call-to-action button in the banner.">
    <div class="grid gap-5 sm:grid-cols-2">
      <AdminField v-model="content.hero.cta.label" label="Button text" path="hero.cta.label" required />
      <AdminField
        v-model="content.hero.cta.href"
        label="Button goes to"
        path="hero.cta.href"
        hint="Use #contact to scroll to the contact form."
      />
    </div>
  </AdminPanel>

  <AdminPanel title="Banner image">
    <AdminImageField v-model="content.hero.image.src" label="Image" path="hero.image.src" hint="A wide photo works best (at least 1600px across)." />
    <AdminField
      v-model="content.hero.image.alt" path="hero.image.alt"
      label="Image description"
      hint="Describe the photo in a few words. Helps visually impaired visitors and Google."
    />
  </AdminPanel>
</template>
