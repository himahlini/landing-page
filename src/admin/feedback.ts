import { reactive } from "vue";

export type ToastTone = "success" | "error" | "info";

export type Toast = {
  id: number;
  tone: ToastTone;
  title: string;
  body?: string;
};

export const toasts = reactive<Toast[]>([]);

let nextToastId = 1;

export const dismissToast = (id: number) => {
  const index = toasts.findIndex((toast) => toast.id === id);
  if (index !== -1) {
    toasts.splice(index, 1);
  }
};

export const showToast = (tone: ToastTone, title: string, body?: string) => {
  const id = nextToastId++;
  toasts.push({ id, tone, title, body });
  window.setTimeout(() => dismissToast(id), tone === "error" ? 8000 : 4500);
};

export type ConfirmOptions = {
  title: string;
  body?: string;
  items?: string[];
  confirmLabel: string;
  tone?: "danger" | "default";
};

export const confirmState = reactive<{ options: ConfirmOptions | null; resolve: ((value: boolean) => void) | null }>({
  options: null,
  resolve: null
});

export const askConfirm = (options: ConfirmOptions) =>
  new Promise<boolean>((resolve) => {
    confirmState.resolve?.(false);
    confirmState.options = options;
    confirmState.resolve = resolve;
  });

export const settleConfirm = (value: boolean) => {
  confirmState.resolve?.(value);
  confirmState.options = null;
  confirmState.resolve = null;
};
