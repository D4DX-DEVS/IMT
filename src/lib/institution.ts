import { institutionCategories, type Institution } from "@/content/schema";

const badges = Object.fromEntries(institutionCategories.map((c) => [c.key, c.badge]));

/** "School", "College" or "Training Centre". */
export const categoryBadge = (i: Institution): string => badges[i.category];

/** Name with its place, e.g. "Women Islamia College, Wandoor". */
export const institutionTitle = (i: Institution) => (i.location ? `${i.name}, ${i.location}` : i.name);

export const shortAffiliation = (a?: string) => a?.replace(/^\(|\)$/g, "");

/**
 * The single line shown under an institution's name on its card: the first sentence of the
 * description (minus any "offering:" lead-in to a list), else the affiliation.
 */
export function institutionSubtitle(i: Institution): string | undefined {
  const source = i.description ?? shortAffiliation(i.affiliation);
  if (!source) return undefined;
  const firstSentence = source.split(/(?<=\.)\s+/)[0];
  return firstSentence
    .replace(/,?\s*offering\s*:?$/i, "")
    .replace(/[\s.:]+$/, "")
    .trim();
}
