import Image from "next/image";
import { BadgeCheck, CheckCircle2, MapPin } from "lucide-react";
import { institutions, type Institution } from "@/data/site";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Spotlight } from "@/components/spotlight";
import { cn } from "@/lib/cn";

export function Institutions() {
  const [featured, ...rest] = institutions;

  return (
    <section id="institutions" className="relative bg-gradient-to-b from-sand via-white to-sand py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow={`${institutions.length} institutions`}
          title="Institutions and Courses"
          intro="From higher education and professional law studies to schools, vocational training and competitive-exam coaching — explore the institutions under the IMT umbrella."
        />

        <Reveal className="mt-16">
          <FeaturedCard inst={featured} />
        </Reveal>

        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((inst, i) => (
            <Reveal key={inst.slug} delay={(i % 3) * 0.08} className="h-full">
              <InstitutionCard inst={inst} index={i + 2} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Title({ inst, className }: { inst: Institution; className?: string }) {
  return (
    <div className={className}>
      {inst.location && (
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] text-gold-600 uppercase">
          <MapPin className="size-3.5" /> {inst.location}
        </p>
      )}
      <h3 className="mt-2 font-display text-2xl leading-snug font-semibold text-brand-800">
        {inst.name}
        {inst.location && <span className="sr-only">, {inst.location}</span>}
      </h3>
      {inst.affiliation && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
          <BadgeCheck className="size-3.5" /> {inst.affiliation.replace(/^\(|\)$/g, "")}
        </p>
      )}
    </div>
  );
}

function Groups({ inst, twoCol = false }: { inst: Institution; twoCol?: boolean }) {
  if (!inst.groups?.length) return null;
  return (
    <div className={cn("mt-5 grid gap-6", twoCol && "md:grid-cols-2")}>
      {inst.groups.map((g, gi) => (
        <div key={gi}>
          {g.title && <h4 className="mb-3 text-sm font-semibold text-brand-700">{g.title}</h4>}
          <ul className="space-y-2">
            {g.items.map((item, ii) => (
              <li key={ii} className="group/item flex items-start gap-2.5 text-[0.95rem] text-ink/75">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-500 transition-transform group-hover/item:scale-125" />
                <span className="transition-colors group-hover/item:text-brand-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FeaturedCard({ inst }: { inst: Institution }) {
  return (
    <Spotlight
      id={inst.slug}
      className="group grid scroll-mt-28 overflow-hidden rounded-3xl bg-white shadow-xl shadow-brand-900/5 ring-1 ring-brand-100 transition duration-500 hover:shadow-2xl hover:shadow-brand-900/10 lg:grid-cols-2"
    >
      <div className="relative min-h-72 overflow-hidden lg:min-h-full">
        <Image
          src={inst.image.src}
          alt={`${inst.name}${inst.location ? `, ${inst.location}` : ""}`}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent" />
        <span className="absolute top-5 left-5 rounded-full bg-gold-400 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-brand-900 uppercase shadow-lg">
          Flagship
        </span>
      </div>
      <div className="p-8 sm:p-10">
        <span className="font-display text-sm text-gold-600">01</span>
        <Title inst={inst} className="mt-1" />
        {inst.description && <p className="mt-4 text-ink/70">{inst.description}</p>}
        <Groups inst={inst} twoCol />
      </div>
    </Spotlight>
  );
}

function InstitutionCard({ inst, index }: { inst: Institution; index: number }) {
  return (
    <Spotlight
      id={inst.slug}
      className="group h-full scroll-mt-28 overflow-hidden rounded-3xl bg-white shadow-lg shadow-brand-900/5 ring-1 ring-brand-100 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-900/10 hover:ring-gold-300/60"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={inst.image.src}
          alt={`${inst.name}${inst.location ? `, ${inst.location}` : ""}`}
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
        <span className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full bg-white/90 font-display text-sm font-semibold text-brand-700 shadow-lg backdrop-blur transition-all duration-500 group-hover:rotate-[360deg] group-hover:bg-gold-400 group-hover:text-brand-900">
          {String(index).padStart(2, "0")}
        </span>
      </div>
      <div className="p-7">
        <Title inst={inst} />
        {inst.description && <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/70">{inst.description}</p>}
        <Groups inst={inst} />
      </div>
      <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-400 via-gold-300 to-brand-400 transition-transform duration-700 group-hover:scale-x-100" />
    </Spotlight>
  );
}
