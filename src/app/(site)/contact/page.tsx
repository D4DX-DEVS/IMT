import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { getContent } from "@/content";
import { siteView } from "@/content/view";
import { PageHero } from "@/components/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

export async function generateMetadata(): Promise<Metadata> {
  const site = siteView((await getContent()).site);
  return {
    title: "Contact Us",
    description: `Get in touch with ${site.name} (${site.shortName}) — ${site.location}. Call ${site.phone} or email ${site.email}.`,
  };
}

type ContactCard = { icon: LucideIcon; title: string; lines: readonly string[]; href?: string; action?: string };

export default async function ContactPage() {
  const content = await getContent();
  const site = siteView(content.site);
  const { institutions } = content;
  const cards: ContactCard[] = [
    { icon: MapPin, title: "Visit us", lines: site.addressLines },
    { icon: Phone, title: "Call us", lines: [site.phone], href: site.phoneHref, action: "Call now" },
    { icon: Mail, title: "Email us", lines: [site.email], href: site.emailHref, action: "Send an email" },
  ];

  return (
    <>
      <PageHero
        title="Contact Us"
        eyebrow="Get in touch"
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 bg-pattern-dark" />
        <div className="container-x">
          <SectionHeading
            eyebrow="We’d love to hear from you"
            title="How can we help?"
            intro="Reach out for admissions, course information or anything about the Trust and its institutions."
          />

          <Stagger className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            {cards.map(({ icon: Icon, title, lines, href, action }) => (
              <StaggerItem
                key={title}
                className="group flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-lg shadow-brand-900/5 ring-1 ring-brand-100 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:ring-gold-300/60"
              >
                <span className="grid size-16 place-items-center rounded-full bg-gold-400 text-brand-900 shadow-lg shadow-gold-500/25 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                  <Icon className="size-7" strokeWidth={1.75} />
                </span>
                <h2 className="mt-6 font-display text-2xl font-semibold text-brand-800">{title}</h2>
                <address className="mt-3 space-y-1 text-ink/70 not-italic">
                  {lines.map((line) => (
                    <p key={line} className="break-words">
                      {line}
                    </p>
                  ))}
                </address>
                {href && action && (
                  <a
                    href={href}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-azure-600 transition hover:text-azure-700"
                  >
                    {action} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                )}
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mx-auto mt-14 flex max-w-5xl flex-col items-center gap-6 rounded-3xl bg-brand-900 bg-pattern p-10 text-center text-white shadow-xl sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">Looking for a particular institution?</h2>
              <p className="mt-2 text-white/70">
                Browse all {institutions.length} schools, colleges and training centres under the Trust.
              </p>
            </div>
            <Link
              href="/#institutions"
              className="group inline-flex shrink-0 items-center gap-3 rounded-xl bg-gold-400 px-7 py-4 font-bold text-brand-900 transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              Explore Institutions
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
