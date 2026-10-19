"use client";

import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-white/70 transition hover:border-gold-400 hover:text-gold-300"
    >
      Back to top
      <ArrowUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}
