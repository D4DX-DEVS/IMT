import Image from "next/image";
import { Eye, Target, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const icons: Record<string, LucideIcon> = { mission: Target, vision: Eye };

type Item = { key: "mission" | "vision"; title: string; paragraphs: readonly string[] };

/** The mission and vision cards: short statements on the home page, full ones on About. */
export function MissionVision({ items }: { items: readonly Item[] }) {
  return (
    <section id="mission-vision" className="relative isolate overflow-hidden py-24 sm:py-28">
      <Image src="/images/ajsas.jpeg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/92 via-brand-900/88 to-brand-950/94" />
      <div className="absolute inset-0 -z-10 bg-pattern" />

      <div className="container-x">
        <SectionHeading eyebrow="Our guiding principles" title="Mission & Vision" tone="dark" />

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-2 lg:gap-8">
          {items.map((item, i) => {
            const Icon = icons[item.key];
            return (
              <Reveal key={item.key} delay={i * 0.15}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] p-7 text-white backdrop-blur-md transition duration-500 hover:-translate-y-1.5 hover:border-gold-300/50 hover:bg-white/[0.12] sm:p-9">
                  <div className="absolute -top-24 -right-24 size-56 rounded-full bg-gold-400/10 blur-2xl transition-all duration-700 group-hover:bg-gold-400/25" />
                  <div className="relative flex items-start gap-5">
                    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold-400 text-brand-900 shadow-lg shadow-gold-500/30 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                      <Icon className="size-7" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-semibold tracking-wide">Our {item.title}</h3>
                      <div className="mt-3 space-y-4 text-[0.95rem] leading-relaxed text-white/80">
                        {item.paragraphs.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
