<script setup lang="ts">
import { Plus } from "lucide-vue-next";

import type { SiteContent } from "../../content/site-content";
import AdminField from "../components/AdminField.vue";
import AdminImageField from "../components/AdminImageField.vue";
import AdminItemCard from "../components/AdminItemCard.vue";
import AdminPanel from "../components/AdminPanel.vue";
import { countErrorsUnder, useAdminForm, useUnpublishedCheck } from "../form-context";
import { itemKey, moveItem, removeItem, useOpenItems } from "../list-actions";

const props = defineProps<{ content: SiteContent }>();
const { errors } = useAdminForm();
const isChanged = useUnpublishedCheck();
const { isOpen, setOpen, addAndOpen } = useOpenItems();

const addPerson = () =>
  addAndOpen(props.content.people.members, { name: "", role: "", credentials: "", bio: "", image: "" });
</script>

<template>
  <AdminPanel title="Section intro" description="The heading above your team on the About page.">
    <AdminField v-model="content.people.label" path="people.label" label="Small label" hint="e.g. Our People" />
    <AdminField v-model="content.people.title" label="Heading" path="people.title" required />
    <AdminField v-model="content.people.description" path="people.description" label="Introduction" multiline :rows="3" />
  </AdminPanel>

  <AdminPanel title="Team members" description="Shown in this order. Use the arrows to move someone up or down.">
    <div class="grid grid-cols-1 gap-3">
      <AdminItemCard
        v-for="(person, index) in content.people.members"
        :key="itemKey(person)"
        :title="person.name || 'New team member'"
        :subtitle="person.role"
        :index="index"
        :total="content.people.members.length"
        :error-count="countErrorsUnder(errors, `people.members.${index}`)"
        :unpublished="isChanged(`people.members.${index}`)"
        :open="isOpen(person)"
        @update:open="setOpen(person, $event)"
        @move-up="moveItem(content.people.members, index, -1)"
        @move-down="moveItem(content.people.members, index, 1)"
        @remove="removeItem(content.people.members, index, person.name, 'team member')"
      >
        <div class="grid gap-5 sm:grid-cols-2">
          <AdminField v-model="person.name" label="Full name" :path="`people.members.${index}.name`" required />
          <AdminField v-model="person.role" label="Role" :path="`people.members.${index}.role`" hint="e.g. Managing Partner" required />
        </div>
        <AdminField v-model="person.credentials" :path="`people.members.${index}.credentials`" label="Qualifications" hint="e.g. LLB (Hons) University of Malaya" />
        <AdminField v-model="person.bio" :path="`people.members.${index}.bio`" label="Biography" multiline :rows="5" />
        <AdminImageField v-model="person.image" :path="`people.members.${index}.image`" label="Photo" aspect="portrait" hint="A head-and-shoulders portrait works best." />
      </AdminItemCard>
    </div>
    <button type="button" class="admin-btn-secondary justify-self-start" @click="addPerson">
      <Plus :size="16" />
      Add team member
    </button>
  </AdminPanel>
</template>
