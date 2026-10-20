"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Building2, Check, GraduationCap, MapPin, School, Search, type LucideIcon } from "lucide-react";
import {
  institutionCategories,
  type CourseGroup,
  type Institution,
  type InstitutionCategory,
} from "@/content/schema";
import { categoryBadge, institutionSubtitle, institutionTitle } from "@/lib/institution";
import { FILTER_EVENT, HASH_FILTERS } from "@/components/institution-link";
import { SectionHeading } from "@/components/section-heading";
import { Spotlight } from "@/components/spotlight";
import { cn } from "@/lib/cn";

type Filter = "all" | InstitutionCategory;

const ease = [0.22, 1, 0.36, 1] as const;

const filters: readonly { key: Filter; label: string }[] = [
  { key: "all", label: "All Institutions" },
  ...institutionCategories.map(({ key, label }) => ({ key, label })),
];

const detailsHref = (i: Institution) => `/institutions/${i.slug}`;

function searchText(i: Institution) {
  return [i.name, i.location, i.description, i.affiliation, categoryBadge(i), ...(i.groups ?? []).flatMap((g) => [g.title, ...g.items])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function Institutions({ institutions }: { institutions: readonly Institution[] }) {
  const featuredSlug = institutions[0]?.slug;
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  // Pre-select a filter from `/#schools`-style links, whether the page was just loaded or already open.
  useEffect(() => {
    const fromHash = () => {
      const next = HASH_FILTERS[window.location.hash];
      if (next) setFilter(next);
    };
    const onFilter = (e: Event) => {
      setFilter((e as CustomEvent<Filter>).detail);
      setQuery("");
    };
    const t = window.setTimeout(fromHash, 0);
    window.addEventListener(FILTER_EVENT, onFilter);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(FILTER_EVENT, onFilter);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  const q = query.trim().toLowerCase();
  const matches = institutions.filter(
    (i) => (filter === "all" || i.category === filter) && (!q || searchText(i).includes(q)),
  );
  const featured = matches.find((i) => i.slug === featuredSlug);
  const rest = matches.filter((i) => i !== featured);

  return (
    <section
      id="institutions"
      className="relative bg-gradient-to-b from-brand-100/80 via-brand-50 to-brand-100/60 py-24 sm:py-28"
    >
      {/* Anchors for the category links in the header and footer. */}
      <span id="schools" className="absolute top-0" />
      <span id="colleges" className="absolute top-0" />
      <span id="training-centres" className="absolute top-0" />
      <div className="absolute inset-0 bg-pattern-dark opacity-70" />

      <div className="container-x relative">
        <SectionHeading
          eyebrow="Our institutions"
          title="Institutions and Courses"
          intro="A network of educational institutions nurturing knowledge, character and community development across Kerala, offering a wide range of academic and training programmes."
        />

        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter institutions" className="flex flex-wrap gap-3">
            {filters.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "relative isolate rounded-full px-6 py-2.5 text-sm font-bold shadow-sm ring-1 transition-colors",
                    active
                      ? "text-white ring-brand-900"
                      : "bg-white text-brand-800 ring-brand-100 hover:text-azure-600 hover:ring-azure-100",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-full bg-brand-900"
                    />
                  )}
                  {f.label}
                </button>
              );
            })}
          </div>

          <label className="relative block w-full lg:max-w-xs">
            <span className="sr-only">Search institutions</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-brand-600/70" />
            <input
              id="institutions-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search institutions…"
              className="w-full rounded-full bg-white py-3 pr-4 pl-11 text-sm text-ink shadow-sm ring-1 ring-brand-100 transition outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-azure-500"
            />
          </label>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          Showing {matches.length} of {institutions.length} institutions
        </p>

        <AnimatePresence mode="popLayout">
          {featured && (
            <motion.div
              key={featured.slug}
              layout="position"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.7, ease }}
              className="mt-8"
            >
              <FeaturedCard inst={featured} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {rest.map((inst, i) => (
              <motion.div
                key={inst.slug}
                layout="position"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.6, ease, delay: (i % 3) * 0.08 }}
                className="h-full"
              >
                <InstitutionCard inst={inst} index={institutions.indexOf(inst) + 1} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {matches.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-brand-100"
          >
            <p className="font-display text-2xl font-semibold text-brand-800">No institutions found</p>
            <p className="mt-2 text-ink/60">Try a different name, place or course.</p>
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
              className="mt-6 rounded-full bg-brand-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Show all institutions
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function CategoryBadge({ inst, className }: { inst: Institution; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-md",
        inst.category === "training" ? "bg-gold-400 text-brand-900" : "bg-azure-500 text-white",
        className,
      )}
    >
      {categoryBadge(inst)}
    </span>
  );
}

function groupLabel(g: CourseGroup, index: number) {
  return /feature|facilit/i.test(g.title ?? "") || index > 0 ? "Campus facilities" : "Course tracks";
}

function FeaturedCard({ inst }: { inst: Institution }) {
  const tiles: { icon: LucideIcon; value: string; label: string }[] = [];
  if (inst.location) tiles.push({ icon: MapPin, value: inst.location, label: "Location" });
  (inst.groups ?? []).slice(0, 2).forEach((g, i) => {
    tiles.push({
      icon: i === 0 ? GraduationCap : Building2,
      value: String(g.items.length),
      label: groupLabel(g, i),
    });
  });
  const CategoryIcon = inst.category === "school" ? School : GraduationCap;

  return (
    <Spotlight
      id={inst.slug}
      className="group grid scroll-mt-36 gap-6 overflow-hidden rounded-3xl bg-white p-3 shadow-xl shadow-brand-900/5 ring-1 ring-brand-100 transition duration-500 hover:shadow-2xl hover:shadow-brand-900/10 lg:grid-cols-[1.08fr_1fr] lg:gap-10"
    >
      <div className="relative min-h-72 overflow-hidden rounded-2xl bg-sky-wash lg:min-h-[22rem]">
        <Image
          src={inst.image.src}
          alt={institutionTitle(inst)}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/35 via-transparent to-transparent" />
        <span className="absolute top-4 left-4 rounded-lg bg-gold-400 px-3.5 py-1.5 text-xs font-extrabold tracking-[0.15em] text-brand-900 uppercase shadow-md">
          Featured
        </span>
        <Link
          href={detailsHref(inst)}
          className="group/btn absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-5 py-2.5 text-sm font-bold text-brand-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-gold-300"
        >
          Course Details
          <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>

      <div className="flex flex-col justify-center p-3 pb-6 lg:py-6 lg:pr-8 lg:pl-0">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-azure-600">
          <CategoryIcon className="size-4" /> {categoryBadge(inst)}
        </p>
        <h3 className="mt-2 text-2xl leading-snug font-extrabold text-brand-900 sm:text-[1.7rem]">
          {institutionTitle(inst)}
        </h3>
        {inst.description && <p className="mt-3 text-ink/65">{inst.description}</p>}

        {tiles.length > 0 && (
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-y border-brand-100 py-5">
            {tiles.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon strokeWidth={1.5} className="size-7 shrink-0 text-brand-600" />
                <div>
                  <dd className="text-sm leading-tight font-extrabold text-brand-900">{value}</dd>
                  <dt className="text-xs text-ink/50">{label}</dt>
                </div>
              </div>
            ))}
          </dl>
        )}

        {inst.groups?.[0] && (
          <ul className="mt-5 space-y-2.5">
            {inst.groups[0].items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[0.95rem] text-ink/75">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-400 text-brand-900">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={detailsHref(inst)}
          className="group/link mt-6 inline-flex w-fit items-center gap-2 text-sm font-bold text-azure-600 transition hover:text-azure-700"
        >
          Course Details
          <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </Spotlight>
  );
}

function InstitutionCard({ inst, index }: { inst: Institution; index: number }) {
  const subtitle = institutionSubtitle(inst);

  return (
    <Spotlight
      id={inst.slug}
      className="group flex h-full scroll-mt-36 flex-col overflow-hidden rounded-2xl bg-white p-3 text-center shadow-lg shadow-brand-900/5 ring-1 ring-brand-100 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-900/10 hover:ring-gold-300/60"
    >
      <Link href={detailsHref(inst)} tabIndex={-1} aria-hidden className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-sky-wash">
        <Image
          src={inst.image.src}
          alt=""
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
        <CategoryBadge inst={inst} className="absolute top-3 left-3" />
        <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-white/90 font-display text-sm font-semibold text-brand-700 shadow-lg backdrop-blur transition-all duration-500 group-hover:rotate-[360deg] group-hover:bg-gold-400 group-hover:text-brand-900">
          {String(index).padStart(2, "0")}
        </span>
      </Link>

      <div className="flex flex-1 flex-col items-center px-3 pt-5 pb-3">
        <h3 className="text-lg leading-snug font-extrabold text-brand-900">{institutionTitle(inst)}</h3>
        {subtitle && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/60">{subtitle}</p>}

        <div className="mt-auto pt-5">
          <Link
            href={detailsHref(inst)}
            aria-label={`Course details of ${institutionTitle(inst)}`}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-brand-200 px-5 py-2.5 text-sm font-bold text-brand-800 transition group-hover:border-brand-800 group-hover:bg-brand-800 group-hover:text-white"
          >
            Course Details
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-400 via-gold-300 to-azure-500 transition-transform duration-700 group-hover:scale-x-100" />
    </Spotlight>
  );
}
