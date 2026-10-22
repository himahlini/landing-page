import { reactive } from "vue";

import { askConfirm, showToast } from "./feedback";

const itemKeys = new WeakMap<object, number>();
let nextItemKey = 1;

// Collection items have no ids, so give each object a stable key for v-for that survives reordering.
export const itemKey = (item: object) => {
  if (!itemKeys.has(item)) {
    itemKeys.set(item, nextItemKey++);
  }
  return itemKeys.get(item);
};

export const moveItem = <T>(items: T[], index: number, offset: -1 | 1) => {
  const target = index + offset;
  if (target < 0 || target >= items.length) return;
  const [item] = items.splice(index, 1);
  items.splice(target, 0, item);
};

export const removeItem = async <T>(items: T[], index: number, name: string, kind: string) => {
  const confirmed = await askConfirm({
    title: `Remove ${name || `this ${kind}`}?`,
    body: `It will disappear from the website the next time you publish. Until then, you can bring it back with “Discard changes”.`,
    confirmLabel: `Remove ${kind}`,
    tone: "danger"
  });

  if (confirmed) {
    items.splice(index, 1);
    showToast("info", `${name || `The ${kind}`} was removed`);
  }
};

// Tracks which collection cards are expanded; newly added items open automatically.
export const useOpenItems = () => {
  const open = reactive(new Set<number | undefined>());

  return {
    isOpen: (item: object) => open.has(itemKey(item)),
    setOpen: (item: object, value: boolean) => (value ? open.add(itemKey(item)) : open.delete(itemKey(item))),
    addAndOpen: <T extends object>(items: T[], item: T) => {
      items.push(item);
      open.add(itemKey(items[items.length - 1]));
    }
  };
};
