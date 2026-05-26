import seedContent from "./site-content.json";

export type SiteContent = typeof seedContent;

const normalizeNavigationHref = (href: string) => {
  if (href === "/about#about") {
    return "/about";
  }

  return href;
};

export const normalizeSiteContent = (content: SiteContent): SiteContent => ({
  ...content,
  navigation: {
    ...content.navigation,
    items: content.navigation.items.map((item) => ({
      ...item,
      href: normalizeNavigationHref(item.href)
    }))
  }
});

export const defaultSiteContent: SiteContent = normalizeSiteContent(seedContent);
