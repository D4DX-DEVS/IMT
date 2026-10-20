import { z } from "zod";

/* ---------- Building blocks ---------- */

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be ${max} characters or fewer`);

/** Optional text: an empty string becomes `undefined`. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .transform((v) => v || undefined)
    .optional();

/** Only images from the built-in set or the uploads folder can be referenced. */
export const imagePath = z
  .string()
  .trim()
  .regex(/^\/(images|uploads)\/[A-Za-z0-9._\-/]+$/, "Choose or upload an image")
  .refine((s) => !s.includes(".."), "Invalid image path");

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens");

const imageDimension = z.number().int().positive().max(20000);

/* ---------- Institutions ---------- */

export const institutionCategoryKeys = ["school", "college", "training"] as const;
export type InstitutionCategory = (typeof institutionCategoryKeys)[number];

export const institutionCategories: readonly { key: InstitutionCategory; label: string; badge: string }[] = [
  { key: "school", label: "Schools", badge: "School" },
  { key: "college", label: "Colleges", badge: "College" },
  { key: "training", label: "Training Centres", badge: "Training Centre" },
];

export const courseGroupSchema = z.object({
  title: optionalText(80),
  items: z.array(requiredText("Item", 160)).min(1, "Add at least one item").max(40),
});

export const institutionSchema = z.object({
  slug: slugSchema,
  name: requiredText("Name", 100),
  category: z.enum(institutionCategoryKeys),
  location: optionalText(80),
  image: z.object({ src: imagePath, width: imageDimension, height: imageDimension }),
  /** Affiliation / recognition line, e.g. "(Recognised by the Govt. of Kerala)". */
  affiliation: optionalText(120),
  description: optionalText(600),
  groups: z.array(courseGroupSchema).max(8).optional(),
});

/* ---------- Gallery ---------- */

export const galleryImageSchema = z.object({
  src: imagePath,
  width: imageDimension,
  height: imageDimension,
  alt: requiredText("Description", 160),
});

/* ---------- News ---------- */

export const postSchema = z.object({
  slug: slugSchema,
  title: requiredText("Title", 140),
  /** Local timestamp like `2026-10-19T09:30:00` (no timezone). */
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/, "Enter a valid date"),
  category: requiredText("Category", 40),
  author: requiredText("Author", 60),
  content: z.array(requiredText("Paragraph", 5000)).min(1, "Write at least one paragraph").max(60),
  comments: z
    .array(
      z.object({
        author: z.string(),
        date: z.string(),
        content: z.array(z.string()),
      }),
    )
    .default([]),
});

/* ---------- Site, home and about ---------- */

export const siteSchema = z.object({
  name: requiredText("Name", 80),
  shortName: requiredText("Short name", 12),
  motto: requiredText("Motto", 120),
  url: z.url("Enter a full URL, e.g. https://example.org").transform((u) => u.replace(/\/+$/, "")),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{6,20}$/, "Enter a valid phone number"),
  email: z.email("Enter a valid email address"),
  addressLines: z.array(requiredText("Address line", 80)).min(1, "Add at least one line").max(4),
  footerBlurb: requiredText("Footer text", 300),
  logo: imagePath,
  emblem: imagePath,
  pillars: z.array(requiredText("Pillar", 24)).length(3),
});

export const homeSchema = z.object({
  hero: z.object({
    eyebrow: requiredText("Eyebrow", 80),
    tagline: requiredText("Tagline", 80),
    text: requiredText("Text", 320),
    image: imagePath,
    imageAlt: requiredText("Image description", 120),
  }),
  about: z.object({ text: requiredText("About text", 900) }),
  stats: z
    .array(
      z.object({
        value: z.number().min(0, "Must be 0 or more").max(10_000_000),
        suffix: z.string().trim().max(4),
        label: requiredText("Label", 40),
        caption: z.string().trim().max(80),
      }),
    )
    .length(4),
  missionVision: z.object({
    mission: requiredText("Mission", 500),
    vision: requiredText("Vision", 500),
  }),
  cta: z.object({
    eyebrow: requiredText("Eyebrow", 40),
    lead: requiredText("First line", 80),
    highlight: requiredText("Highlighted words", 60),
    text: requiredText("Text", 200),
  }),
  campusLife: z
    .array(
      z.object({
        src: imagePath,
        caption: requiredText("Caption", 60),
        alt: requiredText("Image description", 160),
      }),
    )
    .min(1, "Add at least one photo")
    .max(9),
});

export const aboutPageSchema = z.object({
  heading: requiredText("Heading", 120),
  paragraphs: z.array(requiredText("Paragraph", 2500)).min(1).max(8),
  milestones: z
    .array(z.object({ year: requiredText("Year", 20), text: requiredText("Text", 240) }))
    .min(1)
    .max(12),
  mission: z.array(requiredText("Paragraph", 1500)).min(1).max(4),
  vision: z.array(requiredText("Paragraph", 1500)).min(1).max(4),
});

/* ---------- Everything ---------- */

export const contentSchema = z.object({
  site: siteSchema,
  home: homeSchema,
  aboutPage: aboutPageSchema,
  institutions: z.array(institutionSchema).min(1, "Keep at least one institution"),
  gallery: z.array(galleryImageSchema),
  posts: z.array(postSchema),
});

export type Content = z.infer<typeof contentSchema>;
export type SiteSettings = z.infer<typeof siteSchema>;
export type HomeContent = z.infer<typeof homeSchema>;
export type AboutPageContent = z.infer<typeof aboutPageSchema>;
export type Institution = z.infer<typeof institutionSchema>;
export type CourseGroup = z.infer<typeof courseGroupSchema>;
export type GalleryImage = z.infer<typeof galleryImageSchema>;
export type Post = z.infer<typeof postSchema>;

/* ---------- Small helpers ---------- */

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const emailHref = (email: string) => `mailto:${email}`;
