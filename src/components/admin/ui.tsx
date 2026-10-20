"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/cn";
import { buttonClass, inputClass, type ButtonVariant } from "@/components/admin/styles";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold text-brand-900">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-100 sm:p-7", className)}>
      {(title || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-extrabold text-brand-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold text-brand-800">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, className)} />;
}

export function TextArea({ className, rows = 3, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} {...props} className={cn(inputClass, "resize-y leading-relaxed", className)} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select {...props} className={cn(inputClass, "appearance-none pr-9", className)}>
      {children}
    </select>
  );
}

export function Button({
  variant = "secondary",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button type={type} {...props} className={buttonClass(variant, className)} />;
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Button onClick={onClick} className="px-3.5 py-2">
      <Plus className="size-4" /> {children}
    </Button>
  );
}

/** Move up / move down / remove for one row of a list editor. */
export function RowControls({
  index,
  count,
  onMove,
  onRemove,
  removeLabel = "Remove",
  canRemove = true,
}: {
  index: number;
  count: number;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  removeLabel?: string;
  canRemove?: boolean;
}) {
  const icon = "grid size-8 place-items-center rounded-lg text-ink/55 transition hover:bg-brand-50 hover:text-brand-800 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" aria-label="Move up" title="Move up" disabled={index === 0} onClick={() => onMove(-1)} className={icon}>
        <ArrowUp className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Move down"
        title="Move down"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        className={icon}
      >
        <ArrowDown className="size-4" />
      </button>
      <button
        type="button"
        aria-label={removeLabel}
        title={removeLabel}
        disabled={!canRemove}
        onClick={onRemove}
        className={cn(icon, "hover:bg-red-50 hover:text-red-600")}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function Notice({ tone, children }: { tone: "success" | "error" | "info" | "warning"; children: ReactNode }) {
  const styles = {
    success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    error: "bg-red-50 text-red-800 ring-red-200",
    info: "bg-azure-50 text-azure-700 ring-azure-100",
    warning: "bg-amber-50 text-amber-900 ring-amber-200",
  } as const;
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div role={tone === "error" || tone === "warning" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-xl px-4 py-3 text-sm ring-1", styles[tone])}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Sticky bar at the bottom of every editor: the save button and the result of the last save. */
export function SaveBar({
  state,
  pending,
  label = "Save changes",
  extra,
}: {
  state: ActionState;
  pending: boolean;
  label?: string;
  extra?: ReactNode;
}) {
  const statusId = useId();
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-brand-100 bg-white/90 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" disabled={pending} aria-describedby={statusId} className="min-w-36 px-6">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            label
          )}
        </Button>
        {extra}
        <div id={statusId} className="min-w-0 flex-1 text-sm" aria-live="polite">
          {state.status === "success" && (
            <span className="inline-flex items-center gap-2 font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" /> {state.message ?? "Saved"}
            </span>
          )}
          {state.status === "error" && (
            <div className="space-y-1 text-red-700">
              <p className="inline-flex items-center gap-2 font-semibold">
                <AlertCircle className="size-4" /> {state.message ?? "Could not save"}
              </p>
              {state.issues && state.issues.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-9 text-xs">
                  {state.issues.slice(0, 6).map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                  {state.issues.length > 6 && <li>…and {state.issues.length - 6} more</li>}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Edit a list of single-line or multi-line strings (address lines, paragraphs …). */
export function StringListEditor({
  label,
  values,
  onChange,
  multiline = false,
  min = 1,
  max = 10,
  addLabel = "Add",
  itemLabel = "Item",
  placeholder,
  hint,
}: {
  label: string;
  values: readonly string[];
  onChange: (next: string[]) => void;
  multiline?: boolean;
  min?: number;
  max?: number;
  addLabel?: string;
  itemLabel?: string;
  placeholder?: string;
  hint?: string;
}) {
  const move = (index: number, delta: -1 | 1) => {
    const next = [...values];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-brand-800">{label}</legend>
      <div className="space-y-3">
        {values.map((value, i) => (
          <div key={i} className="flex items-start gap-2">
            {multiline ? (
              <TextArea
                aria-label={`${itemLabel} ${i + 1}`}
                value={value}
                rows={4}
                placeholder={placeholder}
                onChange={(e) => onChange(values.map((v, j) => (j === i ? e.target.value : v)))}
              />
            ) : (
              <TextInput
                aria-label={`${itemLabel} ${i + 1}`}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(values.map((v, j) => (j === i ? e.target.value : v)))}
              />
            )}
            <RowControls
              index={i}
              count={values.length}
              onMove={(d) => move(i, d)}
              onRemove={() => onChange(values.filter((_, j) => j !== i))}
              canRemove={values.length > min}
            />
          </div>
        ))}
      </div>
      {values.length < max && (
        <div className="mt-3">
          <AddButton onClick={() => onChange([...values, ""])}>{addLabel}</AddButton>
        </div>
      )}
      {hint && <p className="mt-2 text-xs text-ink/50">{hint}</p>}
    </fieldset>
  );
}
