"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { moveInstitution } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

/** Up/down arrows that reorder an institution in the list (the first one is the featured card). */
export function MoveButtons({ slug, first, last }: { slug: string; first: boolean; last: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const move = (delta: -1 | 1) =>
    startTransition(async () => {
      setError(null);
      const result = await moveInstitution(slug, delta);
      if (result.status === "error") setError(result.message ?? "Could not reorder.");
      else router.refresh();
    });

  const style =
    "grid size-9 place-items-center rounded-lg text-ink/55 ring-1 ring-brand-200 transition hover:bg-brand-50 hover:text-brand-800 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label="Move up" title="Move up" disabled={pending || first} onClick={() => move(-1)} className={cn(style)}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" aria-label="Move down" title="Move down" disabled={pending || last} onClick={() => move(1)} className={cn(style)}>
        <ArrowDown className="size-4" />
      </button>
      {error && <span role="alert" className="text-xs font-semibold text-red-600">{error}</span>}
    </div>
  );
}
