"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

/** Card wrapper with a soft radial glow that follows the cursor. */
export function Spotlight({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "relative before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-500 before:[background:radial-gradient(500px_circle_at_var(--mx)_var(--my),rgba(233,171,38,0.14),transparent_45%)] hover:before:opacity-100",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
