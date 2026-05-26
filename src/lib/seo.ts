import { computed } from "vue";
import { useHead, useSeoMeta } from "@unhead/vue";
import { useRoute } from "vue-router";

import { defaultSiteContent, type SiteContent } from "../content/site-content";

type StructuredData = Record<string, unknown>;

type PageSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: "website" | "article";
  ogImage: string;
  ogImageAlt: string;
  robots: string;
  structuredData: StructuredData[];
};

const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

export const normalizePathname = (pathname: string) => {
  try {
    return new URL(pathname, "http://localhost").pathname;
  } catch {
    return pathname;
  }
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getRuntimeSiteUrl = () => {
  if (typeof window !== "undefined" && window.location.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  const envSiteUrl =
    process.env.CLOUDFLARE_PRODUCTION_URL ||
    process.env.VITE_SITE_URL ||
    import.meta.env.VITE_SITE_URL;

  return envSiteUrl ? trimTrailingSlash(envSiteUrl) : "http://localhost:3000";
};

export const getPublicRoutes = (content: SiteContent = defaultSiteContent) => [
  "/",
  "/about",
  ...content.practiceAreas.map((practice) => `/practice/${practice.slug}`)
];

export const getCanonicalUrl = (pathname: string, siteUrl = getRuntimeSiteUrl()) => {
  const normalizedPath = normalizePathname(pathname);
  return new URL(normalizedPath, `${siteUrl}/`).toString();
};

const getOrganizationSchema = (content: SiteContent, siteUrl: string): StructuredData => ({
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: content.siteMetadata.name,
  description: content.siteMetadata.description,
  url: getCanonicalUrl("/", siteUrl),
  image: content.hero.image.src,
  email: content.contact.communication.email,
  telephone: content.contact.communication.phone,
  foundingDate: String(content.siteMetadata.established),
  areaServed: "Malaysia",
  address: {
    "@type": "PostalAddress",
    streetAddress: content.contact.office.address,
    addressLocality: content.siteMetadata.shortLocation,
    addressCountry: "MY"
  }
});

export const getPageSeo = (pathname: string, content: SiteContent = defaultSiteContent, siteUrl = getRuntimeSiteUrl()): PageSeo => {
  const normalizedPath = normalizePathname(pathname);
  const baseSeo = {
    canonicalPath: normalizedPath,
    ogType: "website" as const,
    ogImage: content.hero.image.src,
    ogImageAlt: content.hero.image.alt || content.siteMetadata.name
  };

  if (normalizedPath === "/") {
    return {
      ...baseSeo,
      title: `${content.siteMetadata.name} | ${content.siteMetadata.location}`,
      description: content.siteMetadata.description,
      robots: DEFAULT_ROBOTS,
      structuredData: [
        getOrganizationSchema(content, siteUrl),
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: content.siteMetadata.name,
          url: getCanonicalUrl("/", siteUrl)
        }
      ]
    };
  }

  if (normalizedPath === "/about") {
    return {
      ...baseSeo,
      title: `About | ${content.siteMetadata.name}`,
      description: content.about.description[0],
      robots: DEFAULT_ROBOTS,
      structuredData: [
        getOrganizationSchema(content, siteUrl),
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `About ${content.siteMetadata.name}`,
          description: content.about.description[0],
          url: getCanonicalUrl("/about", siteUrl)
        }
      ]
    };
  }

  if (normalizedPath.startsWith("/practice/")) {
    const slug = normalizedPath.split("/practice/")[1];
    const practice = content.practiceAreas.find((item) => item.slug === slug);

    if (practice) {
      return {
        ...baseSeo,
        title: `${practice.title} | ${content.siteMetadata.name}`,
        description: practice.description,
        robots: DEFAULT_ROBOTS,
        structuredData: [
          getOrganizationSchema(content, siteUrl),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: practice.title,
            description: practice.description,
            serviceType: practice.title,
            areaServed: "Malaysia",
            provider: {
              "@type": "LegalService",
              name: content.siteMetadata.name,
              url: getCanonicalUrl("/", siteUrl)
            },
            url: getCanonicalUrl(normalizedPath, siteUrl)
          }
        ]
      };
    }
  }

  if (normalizedPath.startsWith("/admin")) {
    return {
      ...baseSeo,
      title: `Admin | ${content.siteMetadata.name}`,
      description: `${content.siteMetadata.name} admin interface.`,
      robots: "noindex, nofollow, noarchive",
      structuredData: []
    };
  }

  return {
    ...baseSeo,
    title: content.siteMetadata.name,
    description: content.siteMetadata.description,
    robots: DEFAULT_ROBOTS,
    structuredData: [getOrganizationSchema(content, siteUrl)]
  };
};

export const useRouteSeo = (content: SiteContent = defaultSiteContent) => {
  const route = useRoute();

  const seo = computed(() => getPageSeo(route.fullPath, content));
  const canonicalUrl = computed(() => getCanonicalUrl(seo.value.canonicalPath));

  useSeoMeta({
    title: () => seo.value.title,
    description: () => seo.value.description,
    robots: () => seo.value.robots,
    ogTitle: () => seo.value.title,
    ogDescription: () => seo.value.description,
    ogType: () => seo.value.ogType,
    ogUrl: () => canonicalUrl.value,
    ogSiteName: () => content.siteMetadata.name,
    ogLocale: "en_MY",
    ogImage: () => seo.value.ogImage,
    ogImageAlt: () => seo.value.ogImageAlt,
    twitterCard: "summary_large_image",
    twitterTitle: () => seo.value.title,
    twitterDescription: () => seo.value.description,
    twitterImage: () => seo.value.ogImage
  });

  useHead({
    link: [
      {
        rel: "canonical",
        href: canonicalUrl
      }
    ],
    script: computed(() =>
      seo.value.structuredData.map((entry) => ({
        type: "application/ld+json",
        textContent: JSON.stringify(entry)
      }))
    )
  });
};
