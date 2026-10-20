"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { HomeContent } from "@/content/schema";
import { InstitutionLink } from "@/components/institution-link";

const ease = [0.22, 1, 0.36, 1] as const;

/** Headline words with a running index, used to stagger their entrance. */
const headlineLines = (() => {
  let index = 0;
  return [["Islamic", "Mission"], ["Trust"]].map((line) => line.map((word) => ({ word, index: index++ })));
})();

export function Hero({ hero, shortName }: { hero: HomeContent["hero"]; shortName: string }) {
  // Driven by raw page scroll (the hero sits at the top of the page) so the content is fully
  // opaque at scroll 0 — `useScroll({ target })` offsets by the page's `scroll-padding-top`.
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 760], ["0%", "30%"]);
  const contentY = useTransform(scrollY, [0, 760], ["0%", "40%"]);
  const fade = useTransform(scrollY, [0, 520], [1, 0]);

  return (
    <section
      className="relative isolate flex min-h-[36rem] items-center overflow-hidden bg-brand-950 pt-24 pb-32 lg:min-h-[43rem] lg:pt-40 lg:pb-36"
    >
      {/* On desktop the photo sits in the right ~80% so the gate clears the headline. */}
      <motion.div style={{ y: bgY }} className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[80%]">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 2.4, ease }}
          className="relative size-full"
        >
          <Image
            src={hero.image}
            alt={hero.imageAlt}
            fill
            preload
            sizes="100vw"
            className="object-cover object-[60%_center]"
          />
        </motion.div>
      </motion.div>
      {/* Navy wash: full on phones, fading out over the photo on desktop. */}
      <div className="absolute inset-0 -z-10 bg-brand-950/80 lg:hidden" />
      <div className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgba(6,20,46,1)_0%,rgba(8,26,56,0.97)_26%,rgba(10,33,71,0.7)_40%,rgba(10,33,71,0.25)_56%,rgba(10,33,71,0)_72%)] lg:block" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-brand-950/60 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-pattern opacity-40" />

      <motion.div style={{ y: contentY, opacity: fade }} className="container-x">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="inline-flex items-center gap-3 text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase sm:text-xs"
          >
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-300 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-gold-400" />
            </span>
            {hero.eyebrow}
          </motion.p>

          <h1 className="mt-6 font-display text-5xl leading-[1.08] font-semibold text-white sm:text-6xl xl:text-7xl">
            {headlineLines.map((line, li) => (
              <span key={li} className="block">
                {line.map(({ word, index }) => (
                  <span key={word} className="mr-[0.25em] inline-block overflow-hidden pb-2 align-bottom">
                    <motion.span
                      className="inline-block"
                      initial={{ y: "110%", rotate: 4 }}
                      animate={{ y: 0, rotate: 0 }}
                      transition={{ duration: 1, delay: 0.45 + index * 0.12, ease }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
                {li === headlineLines.length - 1 && (
                  <span className="inline-block overflow-hidden pb-2 align-bottom">
                    <motion.span
                      className="inline-block bg-gradient-to-r from-gold-300 via-gold-200 to-gold-400 bg-clip-text text-transparent"
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 1, delay: 0.85, ease }}
                    >
                      ({shortName})
                    </motion.span>
                  </span>
                )}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05, ease }}
            className="mt-5 font-display text-xl text-white sm:text-2xl"
          >
            {hero.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.15, ease }}
            className="mt-4 max-w-lg leading-relaxed text-white/80"
          >
            {hero.text}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3, ease }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <InstitutionLink
              href="/#institutions"
              className="group inline-flex items-center gap-3 rounded-xl bg-gold-400 px-7 py-4 font-bold text-brand-900 shadow-xl shadow-gold-500/30 transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              Explore Our Institutions
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </InstitutionLink>
            <Link
              href="/about"
              className="group inline-flex items-center gap-4 rounded-xl border border-white/35 bg-white/5 py-3 pr-3 pl-7 font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-white hover:bg-white/15"
            >
              About IMT
              <span className="grid size-9 place-items-center rounded-full border border-white/40 transition group-hover:border-gold-300 group-hover:bg-gold-400 group-hover:text-brand-900">
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.a
        href="#about-imt"
        aria-label="Scroll to content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute right-8 bottom-36 hidden flex-col items-center gap-4 text-[0.65rem] tracking-[0.35em] text-white/70 uppercase [writing-mode:vertical-rl] xl:flex"
      >
        Scroll
        <span aria-hidden className="h-12 w-px animate-scroll-line bg-gold-300" />
      </motion.a>
    </section>
  );
}
