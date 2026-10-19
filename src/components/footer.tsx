import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { institutions, navLinks, site } from "@/data/site";
import { Reveal } from "@/components/reveal";
import { BackToTop } from "@/components/back-to-top";

async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer id="contact" className="relative isolate overflow-hidden bg-brand-950 text-white">
      <div className="absolute inset-0 -z-10 bg-pattern opacity-70" />
      <div className="absolute -top-40 left-1/2 -z-10 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-brand-600/40 blur-3xl" />

      {/* CTA band */}
      <div className="container-x pt-20">
        <Reveal className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-400 via-gold-300 to-gold-400 p-8 text-brand-900 shadow-2xl shadow-gold-500/20 sm:p-12">
          <div className="absolute -right-16 -bottom-24 size-72 rounded-full border-[40px] border-white/20" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.3em] uppercase opacity-70">Get in touch</p>
              <h2 className="mt-3 font-display text-3xl leading-tight font-semibold sm:text-4xl">{site.motto}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={site.phoneHref}
                className="group inline-flex items-center gap-2 rounded-full bg-brand-800 px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl"
              >
                <Phone className="size-4 transition-transform group-hover:rotate-12" /> {site.phone}
              </a>
              <a
                href={site.emailHref}
                className="group inline-flex items-center gap-2 rounded-full bg-white/70 px-6 py-3.5 font-semibold text-brand-800 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl"
              >
                <Mail className="size-4 transition-transform group-hover:-rotate-12" /> Email us
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Columns */}
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative block size-16 overflow-hidden rounded-full bg-white ring-2 ring-gold-400/70">
              <Image src={site.logo} alt="" fill sizes="64px" className="object-contain" />
            </span>
            <span className="font-display text-2xl font-semibold leading-tight">
              Islamic Mission
              <br />
              Trust <span className="text-gold-300">[IMT]</span>
            </span>
          </Link>
          <p className="mt-6 max-w-sm leading-relaxed text-white/65">
            A beacon of educational and cultural revival since the 1970s — making modern education accessible to all
            sections of society across Kerala.
          </p>
        </div>

        <FooterCol title="Quick Links" className="lg:col-span-2">
          {navLinks.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Institutions" className="lg:col-span-3">
          {institutions.slice(0, 7).map((inst) => (
            <FooterLink key={inst.slug} href={`/#${inst.slug}`}>
              {inst.name}
            </FooterLink>
          ))}
          <FooterLink href="/#institutions">View all 13 →</FooterLink>
        </FooterCol>

        <FooterCol title="Contact" className="lg:col-span-3">
          <li>
            <a href={site.phoneHref} className="group flex items-start gap-3 text-white/70 transition hover:text-white">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-gold-300 transition group-hover:bg-gold-400 group-hover:text-brand-900">
                <Phone className="size-4" />
              </span>
              <span className="pt-1.5">{site.phone}</span>
            </a>
          </li>
          <li>
            <a href={site.emailHref} className="group flex items-start gap-3 text-white/70 transition hover:text-white">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-gold-300 transition group-hover:bg-gold-400 group-hover:text-brand-900">
                <Mail className="size-4" />
              </span>
              <span className="pt-1.5">{site.email}</span>
            </a>
          </li>
          <li className="flex items-start gap-3 text-white/70">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-gold-300">
              <MapPin className="size-4" />
            </span>
            <span className="pt-1.5">Malabar, Kerala, India</span>
          </li>
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 text-sm text-white/50 sm:flex-row">
          <p>
            © <CopyrightYear /> {site.name}. All rights reserved.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <span className="mt-3 block h-0.5 w-10 rounded-full bg-gold-400" />
      <ul className="mt-6 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="group inline-flex items-center gap-1.5 text-white/65 transition hover:text-gold-300">
        <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
        <span className="-ml-5 transition-all group-hover:ml-0">{children}</span>
      </Link>
    </li>
  );
}
