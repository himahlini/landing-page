<script setup lang="ts">
import { ArrowDown, ArrowUp, CornerDownRight, Info } from "lucide-vue-next";

import type { SiteContent } from "../../content/site-content";
import AdminField from "../components/AdminField.vue";
import AdminPanel from "../components/AdminPanel.vue";
import { itemKey, moveItem } from "../list-actions";

defineProps<{ content: SiteContent }>();

const destinations: Record<string, string> = {
  "/|": "Homepage (top)",
  "/|services": "Homepage → Practice areas",
  "/|contact": "Homepage → Contact",
  "/about|": "About page",
  "/about|people": "About page → Our people"
};

type NavItem = SiteContent["navigation"]["items"][number];

// Links only point at sections that already exist, so clients can rename and reorder them but not add or remove them.
const destinationLabel = (item: NavItem) =>
  destinations[`${item.path}|${item.hash}`] ?? `${item.path}${item.hash ? `#${item.hash}` : ""}`;
</script>

<template>
  <AdminPanel title="Menu links" description="Rename the links in the top menu, or use the arrows to change their order.">
    <ul class="grid grid-cols-1 gap-3">
      <li
        v-for="(item, index) in content.navigation.items"
        :key="itemKey(item)"
        class="flex items-start gap-2 rounded-xl border border-stone-200 p-3 sm:p-4"
      >
        <div class="grid min-w-0 flex-1 gap-1.5">
          <AdminField v-model="item.label" :label="`Link ${index + 1}`" :path="`navigation.items.${index}.label`" required />
          <p class="flex items-center gap-1.5 text-sm text-stone-500">
            <CornerDownRight :size="14" class="shrink-0" />
            Goes to: {{ destinationLabel(item) }}
          </p>
        </div>
        <div class="mt-7 flex flex-col">
          <button
            type="button"
            class="admin-icon-btn"
            :disabled="index === 0"
            :aria-label="`Move ${item.label} up`"
            title="Move up"
            @click="moveItem(content.navigation.items, index, -1)"
          >
            <ArrowUp :size="16" />
          </button>
          <button
            type="button"
            class="admin-icon-btn"
            :disabled="index === content.navigation.items.length - 1"
            :aria-label="`Move ${item.label} down`"
            title="Move down"
            @click="moveItem(content.navigation.items, index, 1)"
          >
            <ArrowDown :size="16" />
          </button>
        </div>
      </li>
    </ul>
    <p class="flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
      <Info :size="16" class="mt-0.5 shrink-0" />
      Need a new page or menu link? Contact your website developer.
    </p>
  </AdminPanel>
</template>
