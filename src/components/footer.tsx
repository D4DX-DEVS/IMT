import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { getContent } from "@/content";
import { siteView } from "@/content/view";
import { footerCategoryLinks, poweredBy, quickLinks } from "@/data/nav";
import { InstitutionLink } from "@/components/institution-link";
import { Reveal } from "@/components/reveal";

async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export async function Footer() {
  const content = await getContent();
  const site = siteView(content.site);
  const { cta } = content.home;
  const institutionLinks = [
    ...footerCategoryLinks,
    ...content.institutions.slice(0, 5).map((i) => ({ label: i.name, href: `/#${i.slug}` })),
  ];

  return (
    <footer id="contact" className="relative isolate overflow-hidden bg-brand-950 text-white">
      {/* CTA band */}
      <div className="relative isolate overflow-hidden border-b border-white/10 bg-brand-900">
        <Image
          src="/images/mission-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover object-[80%_center] opacity-80"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900 via-brand-900/90 to-brand-900/25" />
        <div className="absolute inset-0 -z-10 bg-pattern opacity-60" />

        <Reveal className="container-x flex flex-col gap-8 py-12 lg:flex-row lg:items-center lg:gap-12 lg:py-14">
          <div className="lg:w-[33rem] lg:shrink-0">
            <p className="text-xs font-bold tracking-[0.3em] text-gold-300 uppercase">{cta.eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-semibold text-gold-50 sm:text-4xl">
              {cta.lead}
              <br />
              with <span className="text-gold-300">{cta.highlight}</span>
            </h2>
          </div>
          <span aria-hidden className="hidden h-16 w-px bg-white/20 lg:block" />
          <p className="max-w-xs leading-relaxed text-white/75 lg:flex-1">{cta.text}</p>
          <InstitutionLink
            href="/#institutions"
            className="group relative inline-flex w-fit shrink-0 items-center gap-3 overflow-hidden rounded-xl bg-gold-400 px-7 py-4 font-bold text-brand-900 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-gold-300"
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-white/40 blur-sm" />
            Explore Our Institutions
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </InstitutionLink>
        </Reveal>
      </div>

      {/* Columns */}
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" className="flex items-center gap-4" aria-label={`${site.name} home`}>
            <span className="relative block size-16 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-gold-400/70">
              <Image src={site.logo} alt="" fill sizes="64px" className="object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-extrabold tracking-wide uppercase">
                {site.name} ({site.shortName})
              </span>
              <span className="mt-1 block text-[0.65rem] font-semibold tracking-[0.28em] text-white/60 uppercase">
                {site.pillars.join(" · ")}
              </span>
            </span>
          </Link>
          <p className="mt-6 max-w-sm leading-relaxed text-white/65">{site.footerBlurb}</p>
        </div>

        <FooterCol title="Quick Links" className="lg:col-span-2">
          {quickLinks.map((l) => (
            <FooterLink key={l.label} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Our Institutions" className="lg:col-span-3">
          {institutionLinks.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Contact Us" className="lg:col-span-3">
          <li className="flex items-start gap-3 text-white/70">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold-300" />
            <address className="not-italic">
              {site.addressLines.map((line) => (
                <span key={line} className="block text-balance">
                  {line}
                </span>
              ))}
            </address>
          </li>
          <li>
            <a href={site.phoneHref} className="group flex items-start gap-3 text-white/70 transition hover:text-gold-300">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-300" />
              <span>{site.phone}</span>
            </a>
          </li>
          <li>
            <a href={site.emailHref} className="group flex items-start gap-3 text-white/70 transition hover:text-gold-300">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold-300" />
              <span className="break-all">{site.email}</span>
            </a>
          </li>
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        {/* The right padding keeps the floating back-to-top button clear of the text on mid-size screens. */}
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-sm text-white/55 sm:flex-row sm:max-[1400px]:pr-24">
          <p className="text-center sm:text-left">
            © <CopyrightYear /> {site.name} ({site.shortName}). All rights reserved.
          </p>
          <p>
            Powered by:{" "}
            <a
              href={poweredBy.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold-300 underline-offset-4 transition hover:text-gold-200 hover:underline"
            >
              {poweredBy.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h3 className="text-base font-extrabold text-white">{title}</h3>
      <span className="mt-3 block h-0.5 w-10 rounded-full bg-gold-400" />
      <ul className="mt-6 space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <InstitutionLink
        href={href}
        className="group inline-flex items-center gap-1.5 text-white/70 transition hover:text-gold-300"
      >
        <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
        <span className="-ml-5 transition-all group-hover:ml-0">{children}</span>
      </InstitutionLink>
    </li>
  );
}
