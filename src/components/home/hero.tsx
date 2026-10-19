"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { site } from "@/data/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const words = ["Islamic", "Mission", "Trust"];

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-brand-950">
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-20">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 2.4, ease }}
          className="relative size-full"
        >
          <Image
            src="/images/hero-campus.jpeg"
            alt="Main gate of an IMT campus"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/95 via-brand-900/75 to-brand-900/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950 via-transparent to-brand-950/40" />
      <div className="absolute inset-0 -z-10 bg-pattern opacity-50" />

      <motion.div style={{ y: contentY, opacity: fade }} className="container-x grid items-center gap-12 pt-32 pb-40 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.25em] text-gold-200 uppercase backdrop-blur"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-300 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-gold-400" />
            </span>
            Five decades of educational excellence
          </motion.p>

          <h1 className="mt-7 font-display text-5xl leading-[1.05] font-semibold text-white sm:text-7xl xl:text-8xl">
            {words.map((w, i) => (
              <span key={w} className="mr-[0.25em] inline-block overflow-hidden pb-2 align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%", rotate: 4 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ duration: 1, delay: 0.45 + i * 0.12, ease }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
            <span className="inline-block overflow-hidden pb-2 align-bottom">
              <motion.span
                className="inline-block bg-gradient-to-r from-gold-300 via-gold-200 to-gold-400 bg-clip-text text-transparent"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.85, ease }}
              >
                [IMT]
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05, ease }}
            className="mt-6 max-w-xl font-display text-xl text-white/85 italic sm:text-2xl"
          >
            ‘{site.motto}’
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/#institutions"
              className="group inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-4 font-semibold text-brand-900 shadow-xl shadow-gold-500/30 transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              Explore Institutions
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-4 font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-white hover:bg-white/15"
            >
              About IMT
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.4, delay: 0.6, ease }}
          className="relative hidden justify-self-center lg:col-span-4 lg:block"
        >
          <div className="absolute inset-0 -m-6 animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-gold-300/40" />
          <div className="absolute inset-0 -m-14 rounded-full border border-white/10" />
          <div className="relative size-72 animate-float overflow-hidden rounded-full bg-white p-3 shadow-2xl shadow-black/40 ring-4 ring-gold-400/60 xl:size-80">
            <Image src={site.emblem} alt="Islamic Mission Trust emblem" fill sizes="320px" className="object-contain p-2" priority />
          </div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#about-imt"
        aria-label="Scroll to content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-28 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.3em] text-white/60 uppercase md:flex"
      >
        Scroll
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ChevronDown className="size-5" />
        </motion.span>
      </motion.a>
    </section>
  );
}
