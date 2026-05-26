import { defaultSiteContent, type SiteContent } from "../content/site-content";

type PageMeta = {
  title: string;
  description: string;
};

export const getPageMeta = (pathname: string, content: SiteContent = defaultSiteContent): PageMeta => {
  const normalizedPath = (() => {
    try {
      return new URL(pathname, "http://localhost").pathname;
    } catch {
      return pathname;
    }
  })();

  if (normalizedPath === "/") {
    return {
      title: `${content.siteMetadata.name} | ${content.siteMetadata.location}`,
      description: content.siteMetadata.description
    };
  }

  if (normalizedPath === "/about") {
    return {
      title: `About | ${content.siteMetadata.name}`,
      description: content.about.description[0]
    };
  }

  if (normalizedPath.startsWith("/practice/")) {
    const slug = normalizedPath.split("/practice/")[1];
    const practice = content.practiceAreas.find((item) => item.slug === slug);

    if (practice) {
      return {
        title: `${practice.title} | ${content.siteMetadata.name}`,
        description: practice.description
      };
    }
  }

  return {
    title: content.siteMetadata.name,
    description: content.siteMetadata.description
  };
};
