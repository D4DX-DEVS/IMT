"use client";

import { saveHome } from "@/app/admin/actions";
import type { HomeContent } from "@/content/schema";
import { ImageField } from "@/components/admin/image-field";
import { listOps, useSaveForm } from "@/components/admin/use-save-form";
import { AddButton, Card, Field, RowControls, SaveBar, TextArea, TextInput } from "@/components/admin/ui";

const MAX_TILES = 9;

export function HomeForm({ initial }: { initial: HomeContent }) {
  const { value, patch, state, formAction, pending, payload } = useSaveForm(initial, saveHome);
  const { hero, about, stats, missionVision, cta, campusLife } = value;

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />
      <div className="space-y-6">
        <Card title="Hero" description="The large banner at the top of the home page.">
          <div className="grid gap-5">
            <Field label="Small heading above the title">
              <TextInput value={hero.eyebrow} onChange={(e) => patch({ hero: { ...hero, eyebrow: e.target.value } })} />
            </Field>
            <Field label="Tagline" hint="Shown under “Islamic Mission Trust (IMT)”.">
              <TextInput value={hero.tagline} onChange={(e) => patch({ hero: { ...hero, tagline: e.target.value } })} />
            </Field>
            <Field label="Introduction">
              <TextArea rows={3} value={hero.text} onChange={(e) => patch({ hero: { ...hero, text: e.target.value } })} />
            </Field>
            <ImageField
              label="Background photo"
              hint="A wide, landscape photo works best. The left side is darkened for the text."
              value={hero.image}
              onChange={(img) => patch({ hero: { ...hero, image: img.src } })}
            />
            <Field label="Photo description" hint="Read aloud by screen readers.">
              <TextInput value={hero.imageAlt} onChange={(e) => patch({ hero: { ...hero, imageAlt: e.target.value } })} />
            </Field>
          </div>
        </Card>

        <Card title="Key numbers" description="The four figures on the card below the hero. They count up when scrolled into view.">
          <div className="space-y-4">
            {stats.map((stat, i) => (
              <div key={i} className="grid gap-3 rounded-xl bg-brand-50/60 p-4 sm:grid-cols-[7rem_5rem_1fr_1.4fr]">
                <Field label="Number">
                  <TextInput
                    type="number"
                    min={0}
                    value={stat.value}
                    onChange={(e) => patch({ stats: listOps.replace(stats, i, { ...stat, value: Number(e.target.value || 0) }) })}
                  />
                </Field>
                <Field label="After it" hint="e.g. +">
                  <TextInput
                    maxLength={4}
                    value={stat.suffix}
                    onChange={(e) => patch({ stats: listOps.replace(stats, i, { ...stat, suffix: e.target.value }) })}
                  />
                </Field>
                <Field label="Label">
                  <TextInput value={stat.label} onChange={(e) => patch({ stats: listOps.replace(stats, i, { ...stat, label: e.target.value }) })} />
                </Field>
                <Field label="Small caption">
                  <TextInput value={stat.caption} onChange={(e) => patch({ stats: listOps.replace(stats, i, { ...stat, caption: e.target.value }) })} />
                </Field>
              </div>
            ))}
          </div>
        </Card>

        <Card title="About section" description="The short introduction next to the emblem.">
          <Field label="Text">
            <TextArea rows={5} value={about.text} onChange={(e) => patch({ about: { text: e.target.value } })} />
          </Field>
        </Card>

        <Card title="Mission & Vision" description="Short versions for the home page. The About page has its own, longer text.">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Our Mission">
              <TextArea rows={5} value={missionVision.mission} onChange={(e) => patch({ missionVision: { ...missionVision, mission: e.target.value } })} />
            </Field>
            <Field label="Our Vision">
              <TextArea rows={5} value={missionVision.vision} onChange={(e) => patch({ missionVision: { ...missionVision, vision: e.target.value } })} />
            </Field>
          </div>
        </Card>

        <Card
          title="Life across our campuses"
          description="The photo grid near the bottom of the home page. The first photo is shown large."
          actions={
            campusLife.length < MAX_TILES ? (
              <AddButton
                onClick={() =>
                  patch({ campusLife: [...campusLife, { src: "", caption: "", alt: "" }] })
                }
              >
                Add photo
              </AddButton>
            ) : undefined
          }
        >
          <div className="space-y-4">
            {campusLife.map((tile, i) => (
              <div key={i} className="rounded-xl bg-brand-50/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-extrabold text-brand-800">{i === 0 ? "Photo 1 (large)" : `Photo ${i + 1}`}</p>
                  <RowControls
                    index={i}
                    count={campusLife.length}
                    onMove={(d) => patch({ campusLife: listOps.move(campusLife, i, d) })}
                    onRemove={() => patch({ campusLife: listOps.remove(campusLife, i) })}
                    canRemove={campusLife.length > 1}
                    removeLabel="Remove photo"
                  />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <ImageField label="Photo" value={tile.src} onChange={(img) => patch({ campusLife: listOps.replace(campusLife, i, { ...tile, src: img.src }) })} />
                  <div className="space-y-4">
                    <Field label="Caption">
                      <TextInput value={tile.caption} onChange={(e) => patch({ campusLife: listOps.replace(campusLife, i, { ...tile, caption: e.target.value }) })} />
                    </Field>
                    <Field label="Photo description" hint="Read aloud by screen readers.">
                      <TextInput value={tile.alt} onChange={(e) => patch({ campusLife: listOps.replace(campusLife, i, { ...tile, alt: e.target.value }) })} />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Call-to-action band" description="The dark band above the footer, shown on every page.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Small heading">
              <TextInput value={cta.eyebrow} onChange={(e) => patch({ cta: { ...cta, eyebrow: e.target.value } })} />
            </Field>
            <Field label="Text on the right">
              <TextInput value={cta.text} onChange={(e) => patch({ cta: { ...cta, text: e.target.value } })} />
            </Field>
            <Field label="Title, first line">
              <TextInput value={cta.lead} onChange={(e) => patch({ cta: { ...cta, lead: e.target.value } })} />
            </Field>
            <Field label="Title, highlighted words" hint="Shown in gold after “with”.">
              <TextInput value={cta.highlight} onChange={(e) => patch({ cta: { ...cta, highlight: e.target.value } })} />
            </Field>
          </div>
        </Card>
      </div>
      <SaveBar state={state} pending={pending} />
    </form>
  );
}
