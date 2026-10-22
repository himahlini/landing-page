import type { SiteContent } from "../content/site-content";

export type SectionId = "site" | "hero" | "navigation" | "practice" | "about" | "people" | "contact" | "footer";

export type SectionDefinition = {
  id: SectionId;
  label: string;
  description: string;
  keys: (keyof SiteContent)[];
};

export const sections: SectionDefinition[] = [
  { id: "site", label: "Firm details", description: "Name, location and the summary shown in Google results.", keys: ["siteMetadata"] },
  { id: "hero", label: "Homepage banner", description: "The first thing visitors see at the top of the homepage.", keys: ["hero"] },
  { id: "navigation", label: "Menu", description: "The links in the top menu of every page.", keys: ["navigation"] },
  { id: "practice", label: "Practice areas", description: "The services your firm offers. Each one gets its own page.", keys: ["practiceOverview", "practiceAreas"] },
  { id: "about", label: "About the firm", description: "The story of the firm on the About page.", keys: ["about"] },
  { id: "people", label: "Our people", description: "Lawyers and team members shown on the About page.", keys: ["people"] },
  { id: "contact", label: "Contact details", description: "Office address, phone number and email.", keys: ["contact"] },
  { id: "footer", label: "Footer & page labels", description: "Small print at the bottom of each page and button labels.", keys: ["footer", "detailPage"] }
];

export type ValidationErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const linkPattern = /^(\/|#|https?:\/\/|mailto:|tel:)/;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const validateSiteContent = (content: SiteContent): ValidationErrors => {
  const errors: ValidationErrors = {};
  const required = (path: string, value: unknown, label: string) => {
    if (typeof value !== "string" || !value.trim()) {
      errors[path] = `${label} is required.`;
    }
  };

  required("siteMetadata.name", content.siteMetadata.name, "Firm name");
  required("siteMetadata.description", content.siteMetadata.description, "Description");
  required("siteMetadata.location", content.siteMetadata.location, "Location");

  const year = Number(content.siteMetadata.established);
  if (!Number.isInteger(year) || year < 1800 || year > new Date().getFullYear()) {
    errors["siteMetadata.established"] = `Enter a year between 1800 and ${new Date().getFullYear()}.`;
  }

  required("hero.title.primary", content.hero.title.primary, "Headline");
  required("hero.cta.label", content.hero.cta.label, "Button text");
  required("hero.image.src", content.hero.image.src, "Banner image");
  if (content.hero.cta.href && !linkPattern.test(content.hero.cta.href.trim())) {
    errors["hero.cta.href"] = "Links should start with /, #, https:// or mailto:.";
  }

  content.navigation.items.forEach((item, index) => required(`navigation.items.${index}.label`, item.label, "Link text"));

  required("practiceOverview.label", content.practiceOverview.label, "Section heading");
  const seenSlugs = new Map<string, number>();
  content.practiceAreas.forEach((practice, index) => {
    required(`practiceAreas.${index}.title`, practice.title, "Title");
    required(`practiceAreas.${index}.description`, practice.description, "Short summary");

    if (!practice.slug) {
      errors[`practiceAreas.${index}.slug`] = "Web address is required.";
    } else if (!slugPattern.test(practice.slug)) {
      errors[`practiceAreas.${index}.slug`] = "Use lowercase letters, numbers and dashes only (e.g. debt-recovery).";
    } else if (seenSlugs.has(practice.slug)) {
      errors[`practiceAreas.${index}.slug`] = "Another practice area already uses this web address.";
    } else {
      seenSlugs.set(practice.slug, index);
    }
  });

  required("about.label", content.about.label, "Section label");
  content.about.titleLines.forEach((line, index) => required(`about.titleLines.${index}`, line, "Heading line"));
  content.about.description.forEach((paragraph, index) =>
    required(`about.description.${index}`, paragraph, "Paragraph")
  );
  required("about.image.src", content.about.image.src, "Image");

  required("people.title", content.people.title, "Section heading");
  content.people.members.forEach((member, index) => {
    required(`people.members.${index}.name`, member.name, "Name");
    required(`people.members.${index}.role`, member.role, "Role");
  });

  required("contact.office.address", content.contact.office.address, "Address");
  required("contact.communication.phone", content.contact.communication.phone, "Phone number");
  if (!emailPattern.test(content.contact.communication.email.trim())) {
    errors["contact.communication.email"] = "Enter a valid email address, e.g. hello@firm.com.";
  }

  required("footer.copyright", content.footer.copyright, "Copyright line");
  const unknownPlaceholder = content.footer.copyright.match(/\{\{\s*(.*?)\s*\}\}/g)?.find((token) => !/^\{\{\s*CURRENT_YEAR\s*\}\}$/.test(token));
  if (unknownPlaceholder) {
    errors["footer.copyright"] = `${unknownPlaceholder} isn't recognised. The only placeholder available is {{CURRENT_YEAR}}.`;
  }

  return errors;
};

const sectionForPath = (path: string) => {
  const key = path.split(".")[0] as keyof SiteContent;
  return sections.find((section) => section.keys.includes(key))?.id;
};

export const errorCountBySection = (errors: ValidationErrors) =>
  Object.keys(errors).reduce<Partial<Record<SectionId, number>>>((counts, path) => {
    const section = sectionForPath(path);
    if (section) {
      counts[section] = (counts[section] ?? 0) + 1;
    }
    return counts;
  }, {});

export const changedSections = (current: SiteContent, published: SiteContent) =>
  sections
    .filter((section) => section.keys.some((key) => JSON.stringify(current[key]) !== JSON.stringify(published[key])))
    .map((section) => section.id);
