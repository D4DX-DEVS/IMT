"use client";

import { useState } from "react";
import { saveInstitution } from "@/app/admin/actions";
import { institutionCategories, slugify, type Institution, type InstitutionCategory } from "@/content/schema";
import { ImageField, type PickedImage } from "@/components/admin/image-field";
import { listOps, useSaveForm } from "@/components/admin/use-save-form";
import { AddButton, Card, Field, RowControls, SaveBar, Select, TextArea, TextInput } from "@/components/admin/ui";

/** The editing shape: course items are one per line in a textarea. */
type Draft = {
  slug: string;
  name: string;
  category: InstitutionCategory;
  location: string;
  affiliation: string;
  description: string;
  image: PickedImage;
  groups: { title: string; items: string }[];
};

const blank: Draft = {
  slug: "",
  name: "",
  category: "school",
  location: "",
  affiliation: "",
  description: "",
  image: { src: "", width: 1200, height: 800 },
  groups: [],
};

function toDraft(i: Institution): Draft {
  return {
    slug: i.slug,
    name: i.name,
    category: i.category,
    location: i.location ?? "",
    affiliation: i.affiliation ?? "",
    description: i.description ?? "",
    image: i.image,
    groups: (i.groups ?? []).map((g) => ({ title: g.title ?? "", items: g.items.join("\n") })),
  };
}

export function InstitutionForm({ initial }: { initial?: Institution }) {
  const originalSlug = initial?.slug;
  const [slugTouched, setSlugTouched] = useState(false);
  const { value, patch, state, formAction, pending, payload } = useSaveForm<Draft>(
    initial ? toDraft(initial) : blank,
    saveInstitution,
    (d) => {
      const groups = d.groups
        .map((g) => ({ title: g.title, items: g.items.split("\n").map((s) => s.trim()).filter(Boolean) }))
        .filter((g) => g.items.length > 0);
      return {
        originalSlug,
        institution: {
          slug: d.slug,
          name: d.name,
          category: d.category,
          location: d.location,
          affiliation: d.affiliation,
          description: d.description,
          image: d.image,
          groups: groups.length ? groups : undefined,
        },
      };
    },
  );

  const { groups } = value;

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />
      <div className="space-y-6">
        <Card title="Details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2">
              <TextInput
                value={value.name}
                onChange={(e) => patch({ name: e.target.value, ...(!originalSlug && !slugTouched ? { slug: slugify(e.target.value) } : {}) })}
                placeholder="e.g. Al Jamia Arts and Science College"
              />
            </Field>
            <Field label="Type" hint="Decides which filter it appears under on the home page.">
              <Select value={value.category} onChange={(e) => patch({ category: e.target.value as InstitutionCategory })}>
                {institutionCategories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.badge}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Place" hint="Optional. Shown after the name, e.g. “Wandoor”.">
              <TextInput value={value.location} onChange={(e) => patch({ location: e.target.value })} />
            </Field>
            <Field label="Affiliation or recognition" hint="Optional, e.g. “Affiliated to the University of Calicut”." className="sm:col-span-2">
              <TextInput value={value.affiliation} onChange={(e) => patch({ affiliation: e.target.value })} />
            </Field>
            <Field
              label="Description"
              hint="Optional. The first sentence is shown under the name on the card; the full text appears on the details page."
              className="sm:col-span-2"
            >
              <TextArea rows={4} value={value.description} onChange={(e) => patch({ description: e.target.value })} />
            </Field>
            <Field
              label="Page address"
              hint={
                originalSlug
                  ? "Fixed after creation, so existing links keep working."
                  : "Used in the link to this institution’s page. Filled in from the name."
              }
              className="sm:col-span-2"
            >
              <div className="flex items-center overflow-hidden rounded-xl border border-brand-200 bg-white shadow-sm focus-within:border-azure-500 focus-within:ring-2 focus-within:ring-azure-500/20">
                <span className="bg-brand-50 px-3.5 py-2.5 text-sm text-ink/50">/institutions/</span>
                <input
                  value={value.slug}
                  readOnly={!!originalSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    patch({ slug: slugify(e.target.value) });
                  }}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none read-only:text-ink/55"
                  aria-label="Page address"
                />
              </div>
            </Field>
          </div>
        </Card>

        <Card title="Photo" description="Shown on the card, the details page and the gallery of other institutions.">
          <ImageField label="Main photo" value={value.image.src} onChange={(image) => patch({ image })} />
        </Card>

        <Card
          title="Courses and facilities"
          description="Optional lists such as “Undergraduate Programs”. Put each course on its own line."
          actions={groups.length < 8 ? <AddButton onClick={() => patch({ groups: [...groups, { title: "", items: "" }] })}>Add a list</AddButton> : undefined}
        >
          {groups.length === 0 ? (
            <p className="rounded-xl bg-brand-50/60 px-4 py-6 text-center text-sm text-ink/55">No lists yet. Add one to show courses on the details page.</p>
          ) : (
            <div className="space-y-4">
              {groups.map((g, i) => (
                <div key={i} className="rounded-xl bg-brand-50/60 p-4">
                  <div className="mb-3 flex items-end gap-3">
                    <Field label="List heading" hint="Optional" className="flex-1">
                      <TextInput
                        value={g.title}
                        placeholder="e.g. Undergraduate Programs"
                        onChange={(e) => patch({ groups: listOps.replace(groups, i, { ...g, title: e.target.value }) })}
                      />
                    </Field>
                    <RowControls
                      index={i}
                      count={groups.length}
                      onMove={(d) => patch({ groups: listOps.move(groups, i, d) })}
                      onRemove={() => patch({ groups: listOps.remove(groups, i) })}
                      removeLabel="Remove list"
                    />
                  </div>
                  <Field label="Items" hint="One per line.">
                    <TextArea
                      rows={Math.min(10, Math.max(4, g.items.split("\n").length + 1))}
                      value={g.items}
                      onChange={(e) => patch({ groups: listOps.replace(groups, i, { ...g, items: e.target.value }) })}
                    />
                  </Field>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <SaveBar state={state} pending={pending} label={originalSlug ? "Save changes" : "Add institution"} />
    </form>
  );
}
