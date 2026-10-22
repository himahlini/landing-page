<script setup lang="ts">
import { computed } from "vue";

import { currentYearToken, formatCopyright, type SiteContent } from "../../content/site-content";
import AdminField from "../components/AdminField.vue";
import AdminPanel from "../components/AdminPanel.vue";

const props = defineProps<{ content: SiteContent }>();

const copyrightPreview = computed(() => formatCopyright(props.content.footer.copyright));
const yearHint = `Write ${currentYearToken} and it will always show this year automatically.`;
</script>

<template>
  <AdminPanel title="Footer" description="The small print at the bottom of every page.">
    <AdminField
      v-model="content.footer.copyright"
      label="Copyright line"
      path="footer.copyright"
      :hint="yearHint"
      required
    />
    <p class="-mt-2 text-sm text-stone-500">
      Visitors will see: <span class="font-medium text-stone-800">{{ copyrightPreview }}</span>
    </p>
  </AdminPanel>

  <AdminPanel title="Practice area pages" description="Labels used on each practice area's own page.">
    <div class="grid gap-5 sm:grid-cols-2">
      <AdminField v-model="content.detailPage.backLabel" path="detailPage.backLabel" label="“Back” link text" hint="e.g. Back to Overview" />
      <AdminField v-model="content.detailPage.ctaLabel" path="detailPage.ctaLabel" label="Contact button text" hint="e.g. Talk to a lawyer" />
    </div>
    <AdminField v-model="content.detailPage.notFoundMessage" path="detailPage.notFoundMessage" label="Message when a page doesn't exist" />
  </AdminPanel>
</template>
