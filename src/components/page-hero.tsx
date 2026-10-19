"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ChevronRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export function PageHero({
  title,
  eyebrow,
  image = "/images/page-hero.jpg",
  crumbs = [],
}: {
  title: string;
  eyebrow?: string;
  image?: string;
  crumbs?: { label: string; href?: string }[];
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[62vh] items-end overflow-hidden bg-brand-950 pb-20 pt-40">
      <motion.div style={{ y }} className="absolute inset-0 -z-20">
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease }}
          className="relative size-full"
        >
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-top" />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950 via-brand-900/75 to-brand-900/40" />
      <div className="absolute inset-0 -z-10 bg-pattern opacity-60" />

      <motion.div style={{ opacity }} className="container-x text-white">
        {crumbs.length > 0 && (
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
          >
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="size-3.5 text-gold-300" />}
                  {c.href ? (
                    <Link href={c.href} className="transition hover:text-gold-300">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </motion.nav>
        )}
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-6 text-xs font-semibold tracking-[0.35em] text-gold-300 uppercase"
          >
            {eyebrow}
          </motion.p>
        )}
        <h1 className="mt-3 overflow-hidden font-display text-5xl font-semibold tracking-wide sm:text-7xl">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease }}
          >
            {title}
          </motion.span>
        </h1>
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.7, ease }}
          className="mt-6 block h-1 w-24 origin-left rounded-full bg-gradient-to-r from-gold-400 to-gold-200"
        />
      </motion.div>
    </section>
  );
}
