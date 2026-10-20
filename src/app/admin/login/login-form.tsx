"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { login } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, {});
  const [show, setShow] = useState(false);

  const field =
    "w-full rounded-xl border border-brand-200 bg-white py-3 pr-4 pl-11 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink/35 focus:border-azure-500 focus:ring-2 focus:ring-azure-500/20";

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-brand-800">Username</span>
        <span className="relative block">
          <User className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-brand-500" />
          <input name="username" type="text" autoComplete="username" required autoFocus className={field} placeholder="admin" />
        </span>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-brand-800">Password</span>
        <span className="relative block">
          <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-brand-500" />
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className={cn(field, "pr-12")}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink/50 transition hover:bg-brand-50 hover:text-brand-700"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </span>
      </label>

      {state.error && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 text-sm font-extrabold text-brand-900 shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:bg-gold-300 disabled:translate-y-0 disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
