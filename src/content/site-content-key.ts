import type { InjectionKey } from "vue";

import type { SiteContent } from "./site-content";

export const siteContentKey: InjectionKey<SiteContent> = Symbol("site-content");
