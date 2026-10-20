import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Heart, Users } from "lucide-react";
import type { SiteView } from "@/content/view";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";

const values = [
  { icon: BookOpen, label: "Quality Education" },
  { icon: Users, label: "Moral Values" },
  { icon: Heart, label: "Social Responsibility" },
];

export function Intro({ text, site }: { text: string; site: SiteView }) {
  return (
    <section id="about-imt" className="relative overflow-hidden py-24 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-pattern-dark" />
      <div className="container-x grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <Reveal x={-40} y={0} className="relative mx-auto w-full max-w-[19rem] lg:col-span-5 lg:max-w-[21rem]">
          {/* Soft cream / gold glow behind the emblem. */}
          <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-br from-gold-100 via-gold-50 to-brand-50 blur-2xl" />
          <div className="absolute -top-6 -left-14 -z-10 size-44 rounded-full bg-gold-100/70 blur-xl" />
          <div className="absolute inset-0 -m-6 animate-orbit rounded-full border border-dashed border-gold-400/50" />
          <div className="absolute inset-0 -m-12 rounded-full border border-brand-100" />
          <div className="group relative aspect-square animate-float overflow-hidden rounded-full bg-white p-3 shadow-2xl shadow-brand-900/20 ring-4 ring-gold-400/50">
            <Image
              src={site.emblem}
              alt="Islamic Mission Trust emblem"
              fill
              sizes="(min-width: 1024px) 336px, 304px"
              className="object-contain p-2 transition-transform duration-700 group-hover:scale-105 group-hover:rotate-3"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="inline-flex items-center gap-3 text-xs font-bold tracking-[0.3em] text-gold-600 uppercase">
              <span className="h-px w-8 bg-current" /> About us
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight font-semibold text-brand-800 sm:text-5xl">
              {site.name} ({site.shortName})
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">{text}</p>
          </Reveal>

          <Stagger className="mt-9 grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-3">
            {values.map(({ icon: Icon, label }) => (
              <StaggerItem
                key={label}
                className="group flex items-center gap-3 sm:border-l sm:border-brand-100 sm:pl-5 sm:first:border-l-0 sm:first:pl-0"
              >
                <Icon
                  strokeWidth={1.5}
                  className="size-9 shrink-0 text-gold-500 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110"
                />
                <span className="text-sm leading-snug font-bold text-brand-800">{label}</span>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2}>
            <Link
              href="/about"
              className="group relative mt-10 inline-flex items-center gap-3 overflow-hidden rounded-xl bg-gold-400 px-7 py-4 font-bold text-brand-900 shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-white/40 blur-sm" />
              Learn More About IMT
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
