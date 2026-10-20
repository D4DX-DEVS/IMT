export function Marquee({ names }: { names: readonly string[] }) {
  return (
    <div className="relative overflow-hidden border-y border-brand-100 bg-white py-5" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[...names, ...names].map((n, i) => (
          <span key={i} className="flex items-center gap-8 px-4 font-display text-xl whitespace-nowrap text-brand-700/80">
            {n}
            <svg viewBox="0 0 24 24" className="size-4 text-gold-500" fill="currentColor">
              <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
