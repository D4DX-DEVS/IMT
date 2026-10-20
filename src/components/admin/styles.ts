import { cn } from "@/lib/cn";

/** Shared admin class names. Plain module (no "use client") so server pages can call `buttonClass`. */

export const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink/35 focus:border-azure-500 focus:ring-2 focus:ring-azure-500/20 disabled:bg-brand-50 disabled:text-ink/50";

const buttonStyles = {
  primary: "bg-gold-400 text-brand-900 hover:bg-gold-300 shadow-sm",
  secondary: "bg-white text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50",
  danger: "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50",
  ghost: "text-brand-700 hover:bg-brand-50",
} as const;

export type ButtonVariant = keyof typeof buttonStyles;

export function buttonClass(variant: ButtonVariant = "secondary", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
    buttonStyles[variant],
    extra,
  );
}
