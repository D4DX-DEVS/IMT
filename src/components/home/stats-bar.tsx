import { Award, Building2, GraduationCap, Users, type LucideIcon } from "lucide-react";
import type { HomeContent } from "@/content/schema";
import { Counter } from "@/components/counter";
import { Stagger, StaggerItem } from "@/components/reveal";
import { cn } from "@/lib/cn";

/** One icon per position: institutions, years, people, students. */
const icons: LucideIcon[] = [Building2, Award, Users, GraduationCap];

export function StatsBar({ stats }: { stats: HomeContent["stats"] }) {
  return (
    <div className="relative z-10 -mt-16 lg:-mt-20">
      <div className="container-x">
        <Stagger className="grid grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-30px_rgba(10,33,71,0.4)] ring-1 ring-brand-100 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = icons[i % icons.length];
            return (
              <StaggerItem
                key={`${s.label}-${i}`}
                className={cn(
                  "group relative flex flex-col items-start gap-4 px-6 py-7 transition-colors hover:bg-brand-50/70 sm:flex-row sm:items-center sm:gap-5 sm:px-8 sm:py-9",
                  i % 2 === 0 && "border-r border-brand-100",
                  i < 2 && "border-b border-brand-100 lg:border-b-0",
                  i === 1 && "lg:border-r",
                )}
              >
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-400 to-gold-200 transition-transform duration-500 group-hover:scale-x-100" />
                <Icon
                  strokeWidth={1.5}
                  className="size-11 shrink-0 text-gold-500 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110 sm:size-12"
                />
                <div>
                  <p className="font-display text-3xl leading-none font-semibold text-brand-800 sm:text-4xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-brand-600">{s.label}</p>
                  {s.caption && <p className="mt-0.5 text-xs leading-snug text-ink/50">{s.caption}</p>}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </div>
  );
}
