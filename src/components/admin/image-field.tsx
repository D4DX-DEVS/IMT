"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, ImageIcon, Loader2, Upload, X } from "lucide-react";
import type { MediaItem } from "@/content/media";
import { Button, Notice } from "@/components/admin/ui";
import { buttonClass } from "@/components/admin/styles";
import { cn } from "@/lib/cn";

export type PickedImage = { src: string; width: number; height: number };

/** A labelled thumbnail with a button that opens the image library. */
export function ImageField({
  label,
  value,
  onChange,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (image: PickedImage) => void;
  hint?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <span className="mb-1.5 block text-sm font-semibold text-brand-800">{label}</span>
      <div className="flex items-center gap-4 rounded-xl border border-brand-200 bg-white p-3 shadow-sm">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-sky-wash ring-1 ring-brand-100">
          {value ? (
            <Image src={value} alt="" fill sizes="128px" unoptimized className="object-cover" />
          ) : (
            <ImageIcon className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-brand-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-ink/50">{value || "No image selected"}</p>
          <Button className="mt-2 px-3.5 py-2" onClick={() => setOpen(true)}>
            <Upload className="size-4" /> {value ? "Change image" : "Choose image"}
          </Button>
        </div>
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink/50">{hint}</p>}
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={([item]) => {
            onChange({ src: item.src, width: item.width, height: item.height });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

type Tab = "all" | "uploads" | "site";

/**
 * Modal image library: pick an uploaded image or one shipped with the site, or upload new ones.
 * In `multiple` mode several images can be ticked and added at once (used by the gallery).
 */
export function MediaPicker({
  onClose,
  onPick,
  multiple = false,
}: {
  onClose: () => void;
  onPick: (items: MediaItem[]) => void;
  multiple?: boolean;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/media")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((data: { items: MediaItem[] }) => !cancelled && setItems(data.items))
      .catch(() => !cancelled && setError("Could not load the image library."));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const done: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (res.ok) done.push(data as MediaItem);
        else setError(`${file.name}: ${(data as { error?: string }).error ?? "upload failed"}`);
      } catch {
        setError(`${file.name}: the upload could not be sent`);
      }
    }
    setUploading(false);
    if (!done.length) return;
    setItems((prev) => [...done, ...(prev ?? [])]);
    if (multiple) setSelected((prev) => [...prev, ...done]);
    else onPick([done[0]]);
  }

  const visible = (items ?? []).filter((i) => tab === "all" || (tab === "uploads" ? !i.builtin : i.builtin));
  const isSelected = (item: MediaItem) => selected.some((s) => s.src === item.src);

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4 sm:p-8">
      <button type="button" tabIndex={-1} aria-hidden onClick={onClose} className="absolute inset-0 cursor-default bg-brand-950/60 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Image library"
        className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex flex-wrap items-center gap-3 border-b border-brand-100 px-5 py-4 sm:px-6">
          <h2 className="mr-auto text-lg font-extrabold text-brand-900">{multiple ? "Add photos" : "Choose an image"}</h2>
          <label className={cn(buttonClass("primary"), "cursor-pointer focus-within:ring-2 focus-within:ring-azure-500")}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? "Uploading…" : "Upload new"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple={multiple}
              disabled={uploading}
              className="sr-only"
              onChange={(e) => {
                void upload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full text-ink/60 transition hover:bg-brand-50">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex gap-2 border-b border-brand-100 px-5 py-3 sm:px-6">
          {(
            [
              ["all", "All"],
              ["uploads", "Uploaded"],
              ["site", "Site images"],
            ] as const
          ).map(([key, text]) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                tab === key ? "bg-brand-900 text-white" : "text-brand-700 hover:bg-brand-50",
              )}
            >
              {text}
            </button>
          ))}
          <p className="ml-auto self-center text-xs text-ink/45">JPG, PNG, WebP or AVIF · up to 8 MB</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {error && (
            <div className="mb-4">
              <Notice tone="error">{error}</Notice>
            </div>
          )}
          {items === null && !error && (
            <p className="flex items-center gap-2 py-12 text-sm text-ink/55">
              <Loader2 className="size-4 animate-spin" /> Loading images…
            </p>
          )}
          {items !== null && visible.length === 0 && (
            <p className="py-12 text-center text-sm text-ink/55">
              {tab === "uploads" ? "Nothing uploaded yet — use “Upload new”." : "No images found."}
            </p>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {visible.map((item) => {
              const on = isSelected(item);
              return (
                <li key={item.src}>
                  <button
                    type="button"
                    aria-pressed={multiple ? on : undefined}
                    onClick={() =>
                      multiple
                        ? setSelected((prev) => (on ? prev.filter((s) => s.src !== item.src) : [...prev, item]))
                        : onPick([item])
                    }
                    className={cn(
                      "group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-sky-wash ring-2 transition",
                      on ? "ring-azure-500" : "ring-transparent hover:ring-gold-300",
                    )}
                  >
                    <Image src={item.src} alt="" fill sizes="200px" className="object-cover transition duration-300 group-hover:scale-105" />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-brand-950/80 to-transparent px-2 pt-5 pb-1.5 text-left text-[0.65rem] text-white">
                      {item.name}
                    </span>
                    {on && (
                      <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-azure-500 text-white shadow">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {multiple && (
          <footer className="flex items-center justify-between gap-3 border-t border-brand-100 px-5 py-4 sm:px-6">
            <p className="text-sm text-ink/60">{selected.length} selected</p>
            <Button variant="primary" disabled={selected.length === 0} onClick={() => onPick(selected)}>
              Add {selected.length || ""} photo{selected.length === 1 ? "" : "s"}
            </Button>
          </footer>
        )}
      </div>
    </div>
  );
}
