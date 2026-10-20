"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { saveGallery } from "@/app/admin/actions";
import type { GalleryImage } from "@/content/schema";
import { MediaPicker } from "@/components/admin/image-field";
import { listOps, useSaveForm } from "@/components/admin/use-save-form";
import { Button, Card, RowControls, SaveBar, TextInput } from "@/components/admin/ui";

export function GalleryForm({ initial }: { initial: GalleryImage[] }) {
  const { value, setValue, state, formAction, pending, payload } = useSaveForm<GalleryImage[]>(initial, saveGallery);
  const [picking, setPicking] = useState(false);

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />
      <Card
        title={`${value.length} photo${value.length === 1 ? "" : "s"}`}
        description="Shown on the Gallery page in this order. Write a short description for each photo — it is read aloud by screen readers."
        actions={
          <Button variant="primary" onClick={() => setPicking(true)}>
            <ImagePlus className="size-4" /> Add photos
          </Button>
        }
      >
        {value.length === 0 ? (
          <p className="rounded-xl bg-brand-50/60 px-4 py-10 text-center text-sm text-ink/55">No photos yet. Use “Add photos” to upload some.</p>
        ) : (
          <ul className="space-y-3">
            {value.map((photo, i) => (
              <li key={photo.src} className="flex items-center gap-3 rounded-xl bg-brand-50/60 p-3">
                <span className="w-6 shrink-0 text-center text-xs font-bold text-ink/40">{i + 1}</span>
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-sky-wash">
                  <Image src={photo.src} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <TextInput
                  aria-label={`Description of photo ${i + 1}`}
                  placeholder="What does this photo show?"
                  value={photo.alt}
                  onChange={(e) => setValue(listOps.replace(value, i, { ...photo, alt: e.target.value }))}
                />
                <RowControls
                  index={i}
                  count={value.length}
                  onMove={(d) => setValue(listOps.move(value, i, d))}
                  onRemove={() => setValue(listOps.remove(value, i))}
                  removeLabel="Remove photo"
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <SaveBar state={state} pending={pending} />

      {picking && (
        <MediaPicker
          multiple
          onClose={() => setPicking(false)}
          onPick={(items) => {
            const have = new Set(value.map((p) => p.src));
            const added = items.filter((m) => !have.has(m.src)).map((m) => ({ src: m.src, width: m.width, height: m.height, alt: "" }));
            setValue([...value, ...added]);
            setPicking(false);
          }}
        />
      )}
    </form>
  );
}
