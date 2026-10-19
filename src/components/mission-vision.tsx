import Image from "next/image";
import { missionVision } from "@/data/site";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

export function MissionVision() {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      <Image src="/images/mission-bg.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-950/95 via-brand-900/90 to-brand-800/85" />
      <div className="absolute inset-0 -z-10 bg-pattern" />

      <div className="container-x">
        <SectionHeading eyebrow="Our purpose" title="Mission & Vision" tone="dark" />

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {missionVision.map((item, i) => (
            <Reveal key={item.key} delay={i * 0.15}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-8 text-white backdrop-blur-md transition duration-500 hover:-translate-y-1.5 hover:border-gold-300/50 hover:bg-white/[0.11] sm:p-10">
                <div className="absolute -top-24 -right-24 size-56 rounded-full bg-gold-400/10 blur-2xl transition-all duration-700 group-hover:bg-gold-400/25" />
                <div className="flex items-center gap-5">
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gold-400 shadow-lg shadow-gold-500/30 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                    <Image src={item.icon} alt="" width={36} height={36} />
                  </span>
                  <h3 className="font-display text-4xl font-medium tracking-wide">{item.title}</h3>
                </div>
                <div className="mt-6 space-y-4 leading-relaxed text-white/80">
                  {item.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
