<script setup lang="ts">
import type { SiteContent } from "../../content/site-content";
import AdminField from "../components/AdminField.vue";
import AdminPanel from "../components/AdminPanel.vue";

defineProps<{ content: SiteContent }>();
</script>

<template>
  <AdminPanel title="Basic information" description="Used across the website and in Google search results.">
    <AdminField v-model="content.siteMetadata.name" label="Firm name" path="siteMetadata.name" required />
    <div class="grid gap-5 sm:grid-cols-2">
      <AdminField
        v-model="content.siteMetadata.established"
        label="Year established"
        path="siteMetadata.established"
        type="number"
        required
      />
      <AdminField
        v-model="content.siteMetadata.shortLocation" path="siteMetadata.shortLocation"
        label="City"
        hint="A short version, e.g. Kuala Lumpur."
      />
    </div>
    <AdminField
      v-model="content.siteMetadata.location"
      label="Full location"
      path="siteMetadata.location"
      hint="e.g. Kuala Lumpur, Malaysia"
      required
    />
    <AdminField
      v-model="content.siteMetadata.description"
      label="Website description"
      path="siteMetadata.description"
      hint="Shown under your firm's name in Google results and when the website link is shared."
      :recommended-length="160"
      length-note="Google usually shows about 160 characters, so the end may be cut off."
      multiline
      :rows="3"
      required
    />
  </AdminPanel>
</template>
