import { getContent } from "@/content";
import { siteView } from "@/content/view";
import { navLinks, type NavLink } from "@/data/nav";
import { BackToTop } from "@/components/back-to-top";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ScrollProgress } from "@/components/scroll-progress";

/** Hash targets that are not institutions. */
const SECTION_HASHES = new Set(["institutions", "schools", "colleges", "training-centres"]);

/** Drops dropdown links that point at an institution which has since been removed. */
function withoutDeadLinks(links: readonly NavLink[], slugs: Set<string>): NavLink[] {
  return links.map((link) => {
    if (!link.children) return link;
    const children = link.children.filter((child) => {
      const hash = child.href.startsWith("/#") ? child.href.slice(2) : null;
      return !hash || SECTION_HASHES.has(hash) || slugs.has(hash);
    });
    return children.length ? { ...link, children } : { label: link.label, href: link.href };
  });
}

/** The public site's header, footer and floating widgets around a page. */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const { site, institutions } = await getContent();
  const links = withoutDeadLinks(navLinks, new Set(institutions.map((i) => i.slug)));

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-md bg-gold-400 px-4 py-2 font-medium text-brand-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar site={siteView(site)} links={links} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
