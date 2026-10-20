"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import type { ActionState } from "@/lib/action-state";
import { Button } from "@/components/admin/ui";

/**
 * A button that asks for confirmation, runs a server action with `arg`, then refreshes the page.
 * Used for delete and for the up/down reorder buttons.
 */
export function ConfirmAction<A>({
  action,
  arg,
  confirmText,
  children,
  variant = "danger",
  className,
  label,
}: {
  action: (arg: A) => Promise<ActionState>;
  arg: A;
  /** Omit to run without asking. */
  confirmText?: string;
  children: ReactNode;
  variant?: "danger" | "secondary" | "ghost";
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button
        variant={variant}
        disabled={pending}
        aria-label={label}
        title={label}
        className={className}
        onClick={() => {
          if (confirmText && !window.confirm(confirmText)) return;
          setError(null);
          startTransition(async () => {
            const result = await action(arg);
            if (result.status === "error") setError(result.message ?? "That didn’t work.");
            else router.refresh();
          });
        }}
      >
        {children}
      </Button>
      {error && (
        <span role="alert" className="basis-full text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </>
  );
}
