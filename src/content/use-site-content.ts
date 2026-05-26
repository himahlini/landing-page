import { inject } from "vue";

import { defaultSiteContent } from "./site-content";
import { siteContentKey } from "./site-content-key";

export const useSiteContent = () => inject(siteContentKey, defaultSiteContent);
