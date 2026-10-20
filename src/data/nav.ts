/** Static navigation and footer links. The content they point at lives in the admin panel. */

export type NavChild = { label: string; href: string; description?: string };
export type NavLink = { label: string; href: string; children?: readonly NavChild[] };

/**
 * Main navigation. `#schools`, `#colleges` and `#training-centres` pre-select the matching
 * filter in the Institutions section; `#<institution-slug>` scrolls to that institution's card.
 * Links to a slug that no longer exists are dropped automatically (see `SiteChrome`).
 */
export const navLinks: readonly NavLink[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "About IMT", href: "/about", description: "Our story and journey" },
      { label: "Mission & Vision", href: "/about#mission-vision", description: "What guides our work" },
    ],
  },
  {
    label: "Institutions",
    href: "/#institutions",
    children: [
      { label: "All Institutions", href: "/#institutions", description: "Browse every institution" },
      { label: "Schools", href: "/#schools", description: "Higher secondary, upper primary and CBSE" },
      { label: "Colleges", href: "/#colleges", description: "Islamic studies, arts, science and law" },
      { label: "Training Centres", href: "/#training-centres", description: "Vocational and competitive-exam coaching" },
    ],
  },
  {
    label: "Courses",
    href: "/#institutions",
    children: [
      { label: "Islamic Studies", href: "/#al-jamia-al-islamia", description: "Al Jamia Al Islamia" },
      { label: "Law", href: "/#imt-law-college", description: "IMT Law College" },
      { label: "Arts & Science", href: "/#al-jamia-arts-science-college", description: "Al Jamia Arts and Science College" },
      { label: "Women’s Education", href: "/#women-islamia-college", description: "Women Islamia College" },
      { label: "Competitive Exams", href: "/#competex", description: "Competex" },
      { label: "Technical Training", href: "/#al-jamia-iti", description: "Al Jamia ITI" },
    ],
  },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

/** Footer "Quick Links" column. */
export const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Institutions", href: "/#institutions" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;

/** Footer category links, shown before the first few institutions. */
export const footerCategoryLinks = [
  { label: "Schools", href: "/#schools" },
  { label: "Colleges", href: "/#colleges" },
  { label: "Training Centres", href: "/#training-centres" },
] as const;

export const poweredBy = { name: "D4DX Innovations LLP", href: "https://d4dx.co/" } as const;
