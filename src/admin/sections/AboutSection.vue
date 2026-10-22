<script setup lang="ts">
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-vue-next";

import type { SiteContent } from "../../content/site-content";
import AdminField from "../components/AdminField.vue";
import AdminImageField from "../components/AdminImageField.vue";
import AdminPanel from "../components/AdminPanel.vue";
import { askConfirm } from "../feedback";
import { moveItem } from "../list-actions";

const props = defineProps<{ content: SiteContent }>();

// The About page heading always shows exactly two lines.
while (props.content.about.titleLines.length < 2) {
  props.content.about.titleLines.push("");
}

const removeParagraph = async (index: number) => {
  const paragraph = props.content.about.description[index];
  const confirmed =
    !paragraph.trim() ||
    (await askConfirm({
      title: "Remove this paragraph?",
      body: `“${paragraph.slice(0, 120)}${paragraph.length > 120 ? "…" : ""}”`,
      confirmLabel: "Remove paragraph",
      tone: "danger"
    }));

  if (confirmed) props.content.about.description.splice(index, 1);
};
</script>

<template>
  <AdminPanel title="Heading" description="The large heading at the top of the About page.">
    <AdminField v-model="content.about.label" label="Small label above the heading" path="about.label" hint="e.g. The Firm" required />
    <AdminField v-model="content.about.titleLines[0]" label="Heading — first line" path="about.titleLines.0" required />
    <AdminField v-model="content.about.titleLines[1]" label="Heading — second line" path="about.titleLines.1" required />
  </AdminPanel>

  <AdminPanel title="Firm story" description="Paragraphs shown beside the photo, in this order.">
    <div v-for="(_, index) in content.about.description" :key="index" class="flex items-start gap-2">
      <div class="min-w-0 flex-1">
        <AdminField v-model="content.about.description[index]" :label="`Paragraph ${index + 1}`" :path="`about.description.${index}`" multiline :rows="4" required />
      </div>
      <div class="mt-7 flex flex-col">
        <button type="button" class="admin-icon-btn" :disabled="index === 0" aria-label="Move paragraph up" title="Move up" @click="moveItem(content.about.description, index, -1)">
          <ArrowUp :size="16" />
        </button>
        <button
          type="button"
          class="admin-icon-btn"
          :disabled="index === content.about.description.length - 1"
          aria-label="Move paragraph down"
          title="Move down"
          @click="moveItem(content.about.description, index, 1)"
        >
          <ArrowDown :size="16" />
        </button>
        <button type="button" class="admin-icon-btn hover:!bg-rose-50 hover:!text-rose-700" aria-label="Remove paragraph" title="Remove" @click="removeParagraph(index)">
          <Trash2 :size="16" />
        </button>
      </div>
    </div>
    <button type="button" class="admin-btn-secondary justify-self-start" @click="content.about.description.push('')">
      <Plus :size="16" />
      Add paragraph
    </button>
  </AdminPanel>

  <AdminPanel title="Photo">
    <AdminImageField v-model="content.about.image.src" label="Image" path="about.image.src" aspect="portrait" hint="A tall (portrait) photo works best." />
    <AdminField v-model="content.about.image.alt" path="about.image.alt" label="Image description" hint="Describe the photo in a few words. Helps visually impaired visitors and Google." />
  </AdminPanel>
</template>
