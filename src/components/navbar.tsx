"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Mail, Menu, Phone, X } from "lucide-react";
import { navLinks, site } from "@/data/site";
import { cn } from "@/lib/cn";

export function Navbar() {
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
        animate={{ y: hidden ? -140 : 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        {/* Utility bar */}
        <div
          className={cn(
            "hidden overflow-hidden border-b border-white/10 bg-brand-900/70 text-white/80 backdrop-blur transition-all duration-500 lg:block",
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
          )}
        >
          <div className="container-x flex h-10 items-center justify-between text-xs tracking-wide">
            <p className="font-display italic text-gold-200">{site.motto}</p>
            <div className="flex items-center gap-6">
              <a href={site.phoneHref} className="flex items-center gap-2 transition hover:text-gold-300">
                <Phone className="size-3.5" /> {site.phone}
              </a>
              <a href={site.emailHref} className="flex items-center gap-2 transition hover:text-gold-300">
                <Mail className="size-3.5" /> {site.email}
              </a>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div
          className={cn(
            "transition-all duration-500",
            scrolled
              ? "bg-white/85 shadow-[0_8px_30px_-12px_rgba(8,35,58,0.25)] backdrop-blur-xl"
              : "bg-gradient-to-b from-brand-950/60 to-transparent",
          )}
        >
          <nav
            aria-label="Main"
            className={cn(
              "container-x flex items-center justify-between transition-all duration-500",
              scrolled ? "h-16" : "h-20",
            )}
          >
            <Link href="/" className="group flex items-center gap-3" aria-label={`${site.name} home`}>
              <motion.span
                whileHover={{ rotate: 8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 14 }}
                className={cn(
                  "relative block overflow-hidden rounded-full bg-white shadow-md ring-2 ring-gold-400/70 transition-all duration-500",
                  scrolled ? "size-11" : "size-14",
                )}
              >
                <Image src={site.logo} alt="" fill sizes="56px" className="object-contain" priority />
              </motion.span>
              <span className="leading-tight">
                <span
                  className={cn(
                    "block font-display text-lg font-semibold tracking-wide transition-colors sm:text-xl",
                    scrolled ? "text-brand-700" : "text-white",
                  )}
                >
                  Islamic Mission Trust
                </span>
                <span
                  className={cn(
                    "block text-[0.65rem] font-semibold tracking-[0.3em] uppercase transition-colors",
                    scrolled ? "text-gold-600" : "text-gold-300",
                  )}
                >
                  IMT · Kerala
                </span>
              </span>
            </Link>

            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group relative block rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors",
                        scrolled
                          ? active
                            ? "text-brand-700"
                            : "text-ink/70 hover:text-brand-700"
                          : active
                            ? "text-white"
                            : "text-white/75 hover:text-white",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className={cn(
                            "absolute inset-0 -z-10 rounded-full",
                            scrolled ? "bg-brand-50 ring-1 ring-brand-100" : "bg-white/15 ring-1 ring-white/20",
                          )}
                        />
                      )}
                      {link.label}
                      <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-gold-400 transition-transform duration-300 group-hover:scale-x-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-3">
              <a
                href="#contact"
                className="group relative hidden items-center gap-2 overflow-hidden rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-900 shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:bg-gold-300 sm:inline-flex"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-white/40 blur-sm" />
                Contact Us
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className={cn(
                  "grid size-11 place-items-center rounded-full transition lg:hidden",
                  scrolled ? "bg-brand-50 text-brand-700" : "bg-white/15 text-white backdrop-blur",
                )}
              >
                <Menu className="size-5" />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ clipPath: "circle(0% at calc(100% - 2.75rem) 2.5rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.75rem) 2.5rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.75rem) 2.5rem)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[70] flex flex-col bg-brand-900 bg-pattern text-white lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="container-x flex h-20 items-center justify-between">
              <span className="font-display text-xl font-semibold">Islamic Mission Trust</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:rotate-90 hover:bg-white/20"
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="container-x mt-6 flex flex-1 flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between border-b border-white/10 py-4 font-display text-3xl transition-colors",
                      isActive(link.href) ? "text-gold-300" : "text-white hover:text-gold-200",
                    )}
                  >
                    {link.label}
                    <ArrowUpRight className="size-6 opacity-50" />
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="container-x space-y-3 pb-10 text-sm text-white/80"
            >
              <a href={site.phoneHref} className="flex items-center gap-3">
                <Phone className="size-4 text-gold-300" /> {site.phone}
              </a>
              <a href={site.emailHref} className="flex items-center gap-3">
                <Mail className="size-4 text-gold-300" /> {site.email}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
