import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { homeIntro, site } from "@/data/site";
import { Reveal } from "@/components/reveal";

export function Intro() {
  return (
    <section id="about-imt" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-pattern-dark" />
      <div className="container-x grid items-center gap-16 lg:grid-cols-12">
        <Reveal x={-40} y={0} className="relative mx-auto w-full max-w-md lg:col-span-5">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-gold-200/60 to-brand-100/70 blur-2xl" />
          <div className="group relative aspect-square overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-brand-900/15 ring-1 ring-brand-100">
            <div className="absolute inset-4 rounded-[2rem] border border-dashed border-gold-400/50 transition-transform duration-[2s] group-hover:rotate-6" />
            <Image
              src={site.emblem}
              alt="Islamic Mission Trust emblem"
              fill
              sizes="(min-width: 1024px) 420px, 90vw"
              className="object-contain p-12 transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute -right-4 -bottom-6 rounded-2xl bg-brand-700 px-6 py-4 text-white shadow-xl sm:-right-8">
            <p className="font-display text-3xl font-semibold text-gold-300">5</p>
            <p className="text-xs tracking-[0.2em] uppercase opacity-80">Decades</p>
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-gold-600 uppercase">
              <span className="h-px w-8 bg-current" /> Who we are
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight font-semibold text-brand-800 uppercase sm:text-5xl">
              {site.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative mt-8 rounded-2xl border-l-4 border-gold-400 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
              <Quote className="absolute -top-4 right-6 size-9 rounded-full bg-gold-400 p-2 text-brand-900" />
              <p className="text-lg leading-relaxed text-ink/75">{homeIntro}</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              href="/about"
              className="group mt-8 inline-flex items-center gap-3 font-semibold text-brand-700"
            >
              <span className="relative">
                Read our story
                <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-right scale-x-100 bg-gold-400 transition-transform duration-300 group-hover:origin-left group-hover:scale-x-50" />
              </span>
              <span className="grid size-10 place-items-center rounded-full bg-brand-700 text-white transition group-hover:translate-x-1 group-hover:bg-gold-400 group-hover:text-brand-900">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
