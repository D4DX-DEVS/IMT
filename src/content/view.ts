import { emailHref, phoneHref, type SiteSettings } from "./schema";

/** Site settings plus the values derived from them, as the public components use them. */
export function siteView(site: SiteSettings) {
  return {
    ...site,
    phoneHref: phoneHref(site.phone),
    emailHref: emailHref(site.email),
    /** One-line address for the top bar, footer and mobile menu. */
    location: site.addressLines.join(", "),
  };
}

export type SiteView = ReturnType<typeof siteView>;
