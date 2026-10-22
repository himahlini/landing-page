<script setup lang="ts">
import { Plus, Wand2 } from "lucide-vue-next";

import type { SiteContent } from "../../content/site-content";
import AdminField from "../components/AdminField.vue";
import AdminItemCard from "../components/AdminItemCard.vue";
import AdminPanel from "../components/AdminPanel.vue";
import { countErrorsUnder, useAdminForm, useUnpublishedCheck } from "../form-context";
import { itemKey, moveItem, removeItem, useOpenItems } from "../list-actions";
import { slugify } from "../validation";

const props = defineProps<{ content: SiteContent }>();
const { errors } = useAdminForm();
const isChanged = useUnpublishedCheck();
const { isOpen, setOpen, addAndOpen } = useOpenItems();

// The number shown beside each practice area follows its position in the list.
const renumber = () =>
  props.content.practiceAreas.forEach((practice, index) => {
    practice.id = String(index + 1).padStart(2, "0");
  });

const move = (index: number, offset: -1 | 1) => {
  moveItem(props.content.practiceAreas, index, offset);
  renumber();
};

const remove = async (index: number) => {
  const practice = props.content.practiceAreas[index];
  await removeItem(props.content.practiceAreas, index, practice.title, "practice area");
  renumber();
};

const addPractice = () =>
  addAndOpen(props.content.practiceAreas, {
    id: String(props.content.practiceAreas.length + 1).padStart(2, "0"),
    slug: "",
    title: "",
    description: "",
    detailedDescription: ""
  });

const updateTitle = (practice: SiteContent["practiceAreas"][number], title: string) => {
  // Keep the web address in step with the title until it has been set by hand.
  const followsTitle = !practice.slug || practice.slug === slugify(practice.title);
  practice.title = title;
  if (followsTitle) practice.slug = slugify(title);
};
</script>

<template>
  <AdminPanel title="Section intro" description="The heading and introduction above the list of practice areas on the homepage.">
    <AdminField v-model="content.practiceOverview.label" label="Section heading" path="practiceOverview.label" required />
    <AdminField v-model="content.practiceOverview.description" path="practiceOverview.description" label="Introduction" multiline :rows="3" />
  </AdminPanel>

  <AdminPanel title="Practice areas" description="Each practice area appears on the homepage and gets its own page. Use the arrows to change the order.">
    <div class="grid grid-cols-1 gap-3">
      <AdminItemCard
        v-for="(practice, index) in content.practiceAreas"
        :key="itemKey(practice)"
        :title="practice.title ? `${practice.id}. ${practice.title}` : 'New practice area'"
        :subtitle="practice.description"
        :index="index"
        :total="content.practiceAreas.length"
        :error-count="countErrorsUnder(errors, `practiceAreas.${index}`)"
        :unpublished="isChanged(`practiceAreas.${index}`)"
        :open="isOpen(practice)"
        @update:open="setOpen(practice, $event)"
        @move-up="move(index, -1)"
        @move-down="move(index, 1)"
        @remove="remove(index)"
      >
        <AdminField
          :model-value="practice.title"
          label="Title"
          :path="`practiceAreas.${index}.title`"
          required
          @update:model-value="updateTitle(practice, String($event))"
        />
        <div class="grid gap-1.5">
          <AdminField
            v-model="practice.slug"
            label="Web address"
            :path="`practiceAreas.${index}.slug`"
            prefix="/practice/"
            hint="Changing this breaks any old links to this page, so avoid changing it once it's live."
            required
          />
          <button
            v-if="practice.title && practice.slug !== slugify(practice.title)"
            type="button"
            class="admin-btn-ghost justify-self-start !px-2 !py-1 text-xs"
            @click="practice.slug = slugify(practice.title)"
          >
            <Wand2 :size="14" />
            Use “{{ slugify(practice.title) }}”
          </button>
        </div>
        <AdminField
          v-model="practice.description"
          label="Short summary"
          :path="`practiceAreas.${index}.description`"
          hint="One or two sentences shown on the homepage list."
          multiline
          :rows="2"
          :recommended-length="200"
          required
        />
        <AdminField
          v-model="practice.detailedDescription" :path="`practiceAreas.${index}.detailedDescription`"
          label="Full description"
          hint="Shown on this practice area’s own page. Line breaks are kept exactly as you type them."
          multiline
          :rows="8"
        />
      </AdminItemCard>
    </div>
    <button type="button" class="admin-btn-secondary justify-self-start" @click="addPractice">
      <Plus :size="16" />
      Add practice area
    </button>
  </AdminPanel>
</template>
