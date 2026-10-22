import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";

import type { SiteContent } from "../content/site-content";
import type { ValidationErrors } from "./validation";

export type AdminFormContext = {
  errors: ComputedRef<ValidationErrors>;
  content: Ref<SiteContent>;
  publishedContent: Ref<SiteContent>;
  showAllErrors: Ref<boolean>;
  uploadsInFlight: Ref<number>;
  onUnauthorized: () => void;
};

export const adminFormKey: InjectionKey<AdminFormContext> = Symbol("admin-form");

export const useAdminForm = () => {
  const context = inject(adminFormKey);

  if (!context) {
    throw new Error("Admin form fields must be used inside the admin editor.");
  }

  return context;
};

export const countErrorsUnder = (errors: ValidationErrors, prefix: string) =>
  Object.keys(errors).filter((path) => path.startsWith(`${prefix}.`)).length;

const valueAtPath = (source: unknown, path: string) =>
  path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], source);

// True when the value at a dotted path (e.g. "people.members.0.bio") differs from what is live.
export const useUnpublishedCheck = () => {
  const { content, publishedContent } = useAdminForm();

  return (path: string | undefined) =>
    Boolean(path) &&
    JSON.stringify(valueAtPath(content.value, path!)) !== JSON.stringify(valueAtPath(publishedContent.value, path!));
};
