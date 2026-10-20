import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Layers, Mail, MapPin, Phone } from "lucide-react";
import { getContent } from "@/content";
import type { Institution } from "@/content/schema";
import { siteView } from "@/content/view";
import { categoryBadge, institutionSubtitle, institutionTitle, shortAffiliation } from "@/lib/institution";
import { PageHero } from "@/components/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/cn";

export async function generateStaticParams() {
  const { institutions } = await getContent();
  return institutions.map((i) => ({ slug: i.slug }));
}

// Every known slug is prerendered above. This only opts out of the dev-time "instant navigation"
// check, which flags reading `params` for slugs outside that list (those render the not-found UI).
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/institutions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { institutions } = await getContent();
  const inst = institutions.find((i) => i.slug === slug);
  if (!inst) return {};
  return {
    title: institutionTitle(inst),
    description: inst.description ?? `${inst.name} — an institution of the Islamic Mission Trust (IMT), Kerala.`,
  };
}

export default async function InstitutionPage({ params }: PageProps<"/institutions/[slug]">) {
  const { slug } = await params;
  const content = await getContent();
  const { institutions } = content;
  const site = siteView(content.site);
  const inst = institutions.find((i) => i.slug === slug);
  if (!inst) notFound();

  const badge = categoryBadge(inst);
  const affiliation = shortAffiliation(inst.affiliation);
  const hasContent = !!inst.description || !!inst.groups?.length;
  const related = [
    ...institutions.filter((i) => i !== inst && i.category === inst.category),
    ...institutions.filter((i) => i !== inst && i.category !== inst.category),
  ].slice(0, 3);

  return (
    <>
      <PageHero
        compact
        title={inst.name}
        eyebrow={inst.location ? `${badge} · ${inst.location}` : badge}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Institutions", href: "/#institutions" },
          { label: inst.name },
        ]}
      />

      <section className="relative py-20 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-pattern-dark" />
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="inline-flex items-center gap-3 text-xs font-bold tracking-[0.3em] text-gold-600 uppercase">
                <span className="h-px w-8 bg-current" /> {inst.groups?.length ? "Course details" : "About"}
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight font-semibold text-brand-800 sm:text-4xl">
                {institutionTitle(inst)}
              </h2>
              {affiliation && (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-azure-50 px-4 py-1.5 text-sm font-semibold text-azure-700">
                  <BadgeCheck className="size-4" /> {affiliation}
                </p>
              )}
            </Reveal>

            {inst.description && (
              <Reveal delay={0.08}>
                <p className="mt-6 text-lg leading-relaxed text-ink/75">{inst.description}</p>
              </Reveal>
            )}

            {inst.groups && inst.groups.length > 0 && (
              <Stagger className={cn("mt-8 grid gap-6", inst.groups.length > 1 && "xl:grid-cols-2")}>
                {inst.groups.map((g, gi) => (
                  <StaggerItem
                    key={gi}
                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100 transition hover:shadow-lg hover:ring-gold-300/60 sm:p-7"
                  >
                    <h3 className="flex items-center gap-2.5 text-base font-extrabold text-brand-800">
                      <Layers className="size-5 text-gold-500" />
                      {g.title?.replace(/:$/, "") ?? "Courses offered"}
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {g.items.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-[0.95rem] text-ink/75">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-400 text-brand-900">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </StaggerItem>
                ))}
              </Stagger>
            )}

            {!hasContent && (
              <Reveal delay={0.08}>
                <p className="mt-6 rounded-2xl bg-white p-6 text-ink/70 shadow-sm ring-1 ring-brand-100">
                  Course and programme details for this institution are being updated. Please contact the Trust office
                  for admissions and programme information.
                </p>
              </Reveal>
            )}
          </div>

          <aside className="lg:col-span-5">
            <Reveal x={40} y={0} className="lg:sticky lg:top-32">
              <div className="overflow-hidden rounded-3xl bg-white p-3 shadow-xl shadow-brand-900/5 ring-1 ring-brand-100">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sky-wash">
                  <Image
                    src={inst.image.src}
                    alt={institutionTitle(inst)}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                  <span
                    className={cn(
                      "absolute top-3 left-3 rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-md",
                      inst.category === "training" ? "bg-gold-400 text-brand-900" : "bg-azure-500 text-white",
                    )}
                  >
                    {badge}
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <dl className="space-y-4 text-sm">
                    <Fact label="Type" value={badge} icon={Layers} />
                    {inst.location && <Fact label="Location" value={inst.location} icon={MapPin} />}
                    {affiliation && <Fact label="Affiliation" value={affiliation} icon={BadgeCheck} />}
                  </dl>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={site.phoneHref}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-bold text-brand-900 transition hover:-translate-y-0.5 hover:bg-gold-300"
                    >
                      <Phone className="size-4" /> Call to enquire
                    </a>
                    <a
                      href={site.emailHref}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-brand-200 px-5 py-3 text-sm font-bold text-brand-800 transition hover:-translate-y-0.5 hover:border-brand-800 hover:bg-brand-50"
                    >
                      <Mail className="size-4" /> Email us
                    </a>
                  </div>
                </div>
              </div>
              <Link
                href="/#institutions"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-gold-600"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> All institutions
              </Link>
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Explore more" title="Other institutions" />
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <StaggerItem key={r.slug}>
                <RelatedCard inst={r} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}

function Fact({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-4" />
      </span>
      <div>
        <dt className="text-xs text-ink/50">{label}</dt>
        <dd className="font-bold text-brand-900">{value}</dd>
      </div>
    </div>
  );
}

function RelatedCard({ inst }: { inst: Institution }) {
  const subtitle = institutionSubtitle(inst);
  return (
    <Link
      href={`/institutions/${inst.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white p-3 text-center shadow-lg shadow-brand-900/5 ring-1 ring-brand-100 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:ring-gold-300/60"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-sky-wash">
        <Image
          src={inst.image.src}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
      </div>
      <div className="flex flex-1 flex-col items-center px-3 pt-5 pb-3">
        <h3 className="text-lg leading-snug font-extrabold text-brand-900">{institutionTitle(inst)}</h3>
        {subtitle && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">{subtitle}</p>}
        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-azure-600">
          Course Details <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
