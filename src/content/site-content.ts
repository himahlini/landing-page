import seedContent from "./site-content.json";

export type SiteContent = typeof seedContent;

type NavigationItemInput = {
  label: string;
  path?: string;
  hash?: string;
  href?: string;
};

type SiteContentInput = Omit<SiteContent, "navigation"> & {
  navigation: {
    consultationLabel: string;
    items: NavigationItemInput[];
  };
};

const normalizeHash = (hash?: string) => {
  if (!hash) {
    return "";
  }

  return hash.replace(/^#/, "");
};

const normalizeNavigationItem = (item: NavigationItemInput): SiteContent["navigation"]["items"][number] => {
  if (item.href) {
    const [rawPath = "/", rawHash = ""] = item.href.split("#");
    const path = rawPath || "/";
    const hash = normalizeHash(rawHash);

    return {
      label: item.label,
      path,
      hash: path === "/about" && hash === "about" ? "" : hash
    };
  }

  return {
    label: item.label,
    path: item.path ?? "/",
    hash: normalizeHash(item.hash)
  };
};

export const normalizeSiteContent = (content: SiteContentInput): SiteContent => ({
  ...content,
  navigation: {
    ...content.navigation,
    items: content.navigation.items.map((item) => ({
      ...normalizeNavigationItem(item)
    }))
  }
});

export const defaultSiteContent: SiteContent = normalizeSiteContent(seedContent);
