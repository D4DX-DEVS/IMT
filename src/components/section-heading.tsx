import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p
        className={cn(
          "inline-flex items-center gap-3 text-xs font-semibold tracking-[0.3em] uppercase",
          tone === "dark" ? "text-gold-300" : "text-gold-600",
        )}
      >
        <span className="h-px w-8 bg-current" />
        {eyebrow}
        {align === "center" && <span className="h-px w-8 bg-current" />}
      </p>
      <h2
        className={cn(
          "mt-4 font-display text-4xl leading-tight font-semibold text-balance sm:text-5xl",
          tone === "dark" ? "text-white" : "text-brand-800",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-5 text-lg leading-relaxed", tone === "dark" ? "text-white/75" : "text-ink/65")}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}
