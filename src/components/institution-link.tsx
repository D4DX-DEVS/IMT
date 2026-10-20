"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { InstitutionCategory } from "@/content/schema";

export const FILTER_EVENT = "imt:filter";

/** Hash anchors that pre-select a filter in the Institutions section. */
export const HASH_FILTERS: Record<string, InstitutionCategory | "all"> = {
  "#institutions": "all",
  "#schools": "school",
  "#colleges": "college",
  "#training-centres": "training",
};

/**
 * A normal link that also tells the Institutions section to switch filter when the target is one
 * of the category hashes. Next.js hash navigation doesn't fire `hashchange`, hence the event.
 */
export function InstitutionLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        const hash = typeof href === "string" ? href.slice(href.indexOf("#")) : "";
        const filter = HASH_FILTERS[hash];
        if (filter) window.dispatchEvent(new CustomEvent(FILTER_EVENT, { detail: filter }));
        onClick?.(e);
      }}
      {...props}
    />
  );
}
