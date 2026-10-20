import type { Metadata } from "next";
import Image from "next/image";
import { Building2, HandCoins, Sprout } from "lucide-react";
import { getContent } from "@/content";
import { PageHero } from "@/components/page-hero";
import { MissionVision } from "@/components/mission-vision";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Islamic Mission Trust (IMT) came into existence in the 1970s as a beacon of educational and cultural revival in Malabar, Kerala.",
};

const income = [
  { icon: Sprout, label: "Agriculture" },
  { icon: Building2, label: "Commercial establishments" },
  { icon: HandCoins, label: "Donations" },
];

export default async function AboutPage() {
  const { site, aboutPage } = await getContent();
  const { milestones } = aboutPage;
  const [first, ...rest] = aboutPage.paragraphs;

  return (
    <>
      <PageHero title="About" eyebrow="Our story" crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-pattern-dark" />
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-gold-600 uppercase">
                <span className="h-px w-8 bg-current" /> About IMT
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight font-semibold text-brand-800 sm:text-5xl">
                {aboutPage.heading}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 text-lg leading-relaxed text-ink/75 first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:font-semibold first-letter:text-gold-500">
                {first}
              </p>
            </Reveal>
            {rest.map((paragraph, i) => (
              <Reveal key={i} delay={0.15}>
                <p className="mt-6 text-lg leading-relaxed text-ink/75">{paragraph}</p>
              </Reveal>
            ))}

            <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
              {income.map(({ icon: Icon, label }) => (
                <StaggerItem
                  key={label}
                  className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-1 hover:shadow-lg hover:ring-gold-300"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-gold-400 group-hover:text-brand-900">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-brand-800">{label}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="lg:col-span-5">
            <Reveal x={40} y={0} className="relative mx-auto max-w-sm lg:sticky lg:top-32">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gold-200/70 to-brand-100 blur-2xl" />
              <div className="group relative aspect-square overflow-hidden rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-brand-100">
                <Image
                  src={site.emblem}
                  alt="Islamic Mission Trust emblem"
                  fill
                  sizes="384px"
                  className="object-contain p-10 transition-transform duration-[1.5s] group-hover:rotate-6 group-hover:scale-105"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading eyebrow="Journey" title="Milestones" />
          <ol className="relative mx-auto mt-16 max-w-3xl">
            <span className="absolute top-2 bottom-2 left-[7.5rem] hidden w-px bg-gradient-to-b from-gold-400 via-brand-200 to-transparent sm:block" />
            {milestones.map((m, i) => (
              <Reveal key={m.year} delay={i * 0.1}>
                <li className="group relative grid gap-2 pb-10 sm:grid-cols-[6.5rem_1fr] sm:gap-10">
                  <span className="font-display text-xl font-semibold text-gold-600 sm:text-right">{m.year}</span>
                  <span className="absolute top-2 left-[7.5rem] hidden size-3 -translate-x-1/2 rounded-full bg-gold-400 ring-4 ring-gold-100 transition-transform group-hover:scale-150 sm:block" />
                  <p className="rounded-2xl bg-sand p-5 text-ink/75 ring-1 ring-brand-100 transition group-hover:bg-brand-50 group-hover:ring-brand-200">
                    {m.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <MissionVision
        items={[
          { key: "mission", title: "Mission", paragraphs: aboutPage.mission },
          { key: "vision", title: "Vision", paragraphs: aboutPage.vision },
        ]}
      />
    </>
  );
}
