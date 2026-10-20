"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, ChevronDown, MapPin, Mail, Menu, Phone, Search, X } from "lucide-react";
import type { NavLink } from "@/data/nav";
import type { SiteView } from "@/content/view";
import { InstitutionLink } from "@/components/institution-link";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

export function Navbar({ site, links }: { site: SiteView; links: readonly NavLink[] }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    // Hide on fast scroll down, reveal on scroll up.
    setHidden(y > 480 && y > prev + 4 && !open);
    if (y < prev - 4) setHidden(false);
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -160 : 0, opacity: 1 }}
        transition={{ duration: 0.45, ease }}
        className="fixed inset-x-0 top-0 z-50"
      >
        {/* Utility bar */}
        <div
          className={cn(
            "hidden overflow-hidden bg-brand-950 text-white/80 transition-all duration-500 lg:block",
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
          )}
        >
          <div className="container-x flex h-10 items-center justify-between text-xs tracking-wide">
            <div className="flex items-center gap-6">
              <a href={site.phoneHref} className="flex items-center gap-2 transition hover:text-gold-300">
                <Phone className="size-3.5 text-gold-300" /> {site.phone}
              </a>
              <a href={site.emailHref} className="flex items-center gap-2 transition hover:text-gold-300">
                <Mail className="size-3.5 text-gold-300" /> {site.email}
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="size-3.5 text-gold-300" /> {site.location}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/news" className="transition hover:text-gold-300">
                News
              </Link>
              <span aria-hidden className="h-3 w-px bg-white/20" />
              <InstitutionLink
                href="/#institutions"
                aria-label="Search institutions"
                className="grid size-6 place-items-center rounded-full transition hover:bg-white/10 hover:text-gold-300"
              >
                <Search className="size-3.5" />
              </InstitutionLink>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div
          className={cn(
            "border-b bg-white transition-all duration-500",
            scrolled
              ? "border-transparent bg-white/90 shadow-[0_8px_30px_-12px_rgba(10,33,71,0.28)] backdrop-blur-xl"
              : "border-brand-100",
          )}
        >
          <nav
            aria-label="Main"
            className={cn(
              "container-x flex items-center justify-between gap-6 transition-all duration-500",
              scrolled ? "h-16" : "h-20",
            )}
          >
            <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label={`${site.name} home`}>
              <motion.span
                whileHover={{ rotate: 8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 14 }}
                className={cn(
                  "relative block overflow-hidden rounded-full bg-white shadow-md ring-2 ring-gold-400/70 transition-all duration-500",
                  scrolled ? "size-11" : "size-14",
                )}
              >
                <Image src={site.logo} alt="" fill sizes="56px" loading="eager" className="object-contain" />
              </motion.span>
              <span className="leading-tight">
                <span className="block text-[0.95rem] font-extrabold tracking-wide text-brand-800 uppercase sm:text-lg">
                  {site.name} ({site.shortName})
                </span>
                <span className="mt-0.5 hidden text-[0.6rem] font-semibold tracking-[0.28em] text-brand-600/70 uppercase sm:block">
                  {site.pillars.join(" · ")}
                </span>
              </span>
            </Link>

            <ul className="hidden items-center gap-0.5 xl:flex">
              {links.map((link) => (
                <NavItem key={link.label} link={link} active={isActive(link.href)} />
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <InstitutionLink
                href="/#institutions"
                className="group relative hidden items-center gap-2 overflow-hidden rounded-xl bg-gold-400 px-5 py-2.5 text-sm font-bold text-brand-900 shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:bg-gold-300 md:inline-flex"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-white/40 blur-sm" />
                Explore Institutions
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </InstitutionLink>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100 xl:hidden"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <MobileMenu open={open} onClose={() => setOpen(false)} isActive={isActive} site={site} links={links} />
    </>
  );
}

function NavItem({ link, active }: { link: NavLink; active: boolean }) {
  const [open, setOpen] = useState(false);
  const hasMenu = !!link.children?.length;

  return (
    <li
      className="relative"
      onMouseEnter={() => hasMenu && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => hasMenu && setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <InstitutionLink
        href={link.href}
        aria-haspopup={hasMenu ? "menu" : undefined}
        aria-expanded={hasMenu ? open : undefined}
        className={cn(
          "group relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors xl:px-4",
          active ? "text-brand-700" : "text-ink/75 hover:text-brand-700",
        )}
      >
        {link.label}
        {hasMenu && (
          <ChevronDown className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")} />
        )}
        {active ? (
          <motion.span
            layoutId="nav-underline"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-gold-400 xl:inset-x-4"
          />
        ) : (
          <span className="absolute inset-x-3.5 -bottom-0.5 h-px origin-left scale-x-0 bg-gold-400 transition-transform duration-300 group-hover:scale-x-100 xl:inset-x-4" />
        )}
      </InstitutionLink>

      <AnimatePresence>
        {hasMenu && open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease }}
            className="absolute top-full left-0 z-10 pt-3"
          >
            <ul
              role="menu"
              className="w-72 rounded-2xl bg-white p-2 shadow-2xl shadow-brand-900/15 ring-1 ring-brand-100"
            >
              {link.children!.map((child) => (
                <li key={child.label} role="none">
                  <InstitutionLink
                    role="menuitem"
                    href={child.href}
                    onClick={() => setOpen(false)}
                    className="group/item flex items-start justify-between gap-3 rounded-xl px-3.5 py-2.5 transition hover:bg-brand-50"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-brand-800">{child.label}</span>
                      {child.description && (
                        <span className="mt-0.5 block text-xs leading-snug text-ink/55">{child.description}</span>
                      )}
                    </span>
                    <ArrowRight className="mt-1 size-3.5 shrink-0 -translate-x-1 text-gold-500 opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                  </InstitutionLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function MobileMenu({
  open,
  onClose,
  isActive,
  site,
  links,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
  site: SiteView;
  links: readonly NavLink[];
}) {
  const [group, setGroup] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          initial={{ clipPath: "circle(0% at calc(100% - 2.75rem) 2.5rem)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 2.75rem) 2.5rem)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 2.75rem) 2.5rem)" }}
          transition={{ duration: 0.6, ease }}
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-brand-900 bg-pattern text-white xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="container-x flex h-20 shrink-0 items-center justify-between">
            <span className="text-lg font-extrabold tracking-wide uppercase">
              {site.name} ({site.shortName})
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:rotate-90 hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
          </div>

          <ul className="container-x mt-4 flex flex-col">
            {links.map((link, i) => {
              const expandable = !!link.children?.length;
              const expanded = group === link.label;
              return (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease }}
                  className="border-b border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <InstitutionLink
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "flex-1 py-4 font-display text-2xl transition-colors",
                        isActive(link.href) ? "text-gold-300" : "text-white hover:text-gold-200",
                      )}
                    >
                      {link.label}
                    </InstitutionLink>
                    {expandable && (
                      <button
                        type="button"
                        onClick={() => setGroup(expanded ? null : link.label)}
                        aria-expanded={expanded}
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${link.label}`}
                        className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                      >
                        <ChevronDown className={cn("size-5 transition-transform", expanded && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {expandable && expanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="overflow-hidden pb-3 pl-4"
                      >
                        {link.children!.map((child) => (
                          <li key={child.label}>
                            <InstitutionLink
                              href={child.href}
                              onClick={onClose}
                              className="block rounded-lg px-3 py-2.5 text-white/80 transition hover:bg-white/10 hover:text-gold-200"
                            >
                              {child.label}
                              {child.description && (
                                <span className="block text-xs text-white/50">{child.description}</span>
                              )}
                            </InstitutionLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
            <motion.li
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease }}
              className="border-b border-white/10"
            >
              <Link href="/news" onClick={onClose} className="block py-4 font-display text-2xl hover:text-gold-200">
                News
              </Link>
            </motion.li>
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="container-x mt-auto space-y-3 py-8 text-sm text-white/80"
          >
            <a href={site.phoneHref} className="flex items-center gap-3">
              <Phone className="size-4 text-gold-300" /> {site.phone}
            </a>
            <a href={site.emailHref} className="flex items-center gap-3">
              <Mail className="size-4 text-gold-300" /> {site.email}
            </a>
            <p className="flex items-center gap-3">
              <MapPin className="size-4 text-gold-300" /> {site.location}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
