<script setup lang="ts">
import type { SiteContent } from "../../content/site-content";
import AdminField from "../components/AdminField.vue";
import AdminPanel from "../components/AdminPanel.vue";

defineProps<{ content: SiteContent }>();
</script>

<template>
  <AdminPanel title="Contact section" description="Shown at the bottom of the homepage.">
    <AdminField v-model="content.contact.label" path="contact.label" label="Heading" hint="e.g. Connect with us." />
  </AdminPanel>

  <AdminPanel title="Office">
    <AdminField v-model="content.contact.office.label" path="contact.office.label" label="Label" hint="e.g. Our Office" />
    <AdminField v-model="content.contact.office.address" label="Address" path="contact.office.address" multiline :rows="4" required />
  </AdminPanel>

  <AdminPanel title="Phone & email" description="Also used by Google to show your contact details.">
    <AdminField v-model="content.contact.communication.label" path="contact.communication.label" label="Label" hint="e.g. Direct Communication" />
    <div class="grid gap-5 sm:grid-cols-2">
      <AdminField v-model="content.contact.communication.phone" label="Phone number" path="contact.communication.phone" type="tel" required />
      <AdminField v-model="content.contact.communication.email" label="Email address" path="contact.communication.email" type="email" required />
    </div>
  </AdminPanel>
</template>
