import { stats } from "@/data/site";
import { Counter } from "@/components/counter";
import { Stagger, StaggerItem } from "@/components/reveal";

export function StatsBar() {
  return (
    <div className="relative z-10 -mt-24">
      <div className="container-x">
        <Stagger className="grid grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-30px_rgba(8,35,58,0.35)] ring-1 ring-brand-100 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StaggerItem
              key={s.label}
              className={`group relative px-6 py-8 text-center transition-colors hover:bg-brand-50 sm:py-10 ${
                i % 2 === 0 ? "border-r border-brand-100" : ""
              } ${i < 2 ? "border-b border-brand-100 lg:border-b-0" : ""} ${i === 1 ? "lg:border-r" : ""}`}
            >
              <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-400 to-gold-200 transition-transform duration-500 group-hover:scale-x-100" />
              <p className="font-display text-4xl font-semibold text-brand-700 sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-ink/55 uppercase sm:text-sm">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}
