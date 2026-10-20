"use client";

import { saveSite } from "@/app/admin/actions";
import type { SiteSettings } from "@/content/schema";
import { ImageField } from "@/components/admin/image-field";
import { useSaveForm } from "@/components/admin/use-save-form";
import { Card, Field, SaveBar, StringListEditor, TextArea, TextInput } from "@/components/admin/ui";

export function SiteForm({ initial }: { initial: SiteSettings }) {
  const { value, patch, state, formAction, pending, payload } = useSaveForm(initial, saveSite);

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />
      <div className="space-y-6">
        <Card title="Identity" description="Shown in the header, footer, browser tab and search results.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Organisation name">
              <TextInput value={value.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <Field label="Short name" hint="Used in brackets and page titles, e.g. IMT.">
              <TextInput value={value.shortName} onChange={(e) => patch({ shortName: e.target.value })} />
            </Field>
            <Field label="Motto" className="sm:col-span-2">
              <TextInput value={value.motto} onChange={(e) => patch({ motto: e.target.value })} />
            </Field>
            <Field label="Website address" hint="Used for the sitemap and link previews." className="sm:col-span-2">
              <TextInput type="url" value={value.url} onChange={(e) => patch({ url: e.target.value })} placeholder="https://example.org" />
            </Field>
          </div>
        </Card>

        <Card title="Contact details" description="Shown in the top bar, footer, mobile menu and the Contact Us page.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone">
              <TextInput type="tel" value={value.phone} onChange={(e) => patch({ phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <TextInput type="email" value={value.email} onChange={(e) => patch({ email: e.target.value })} />
            </Field>
          </div>
          <div className="mt-5">
            <StringListEditor
              label="Address"
              itemLabel="Address line"
              values={value.addressLines}
              onChange={(addressLines) => patch({ addressLines })}
              max={4}
              addLabel="Add address line"
              hint="One line per row. The top bar joins them with commas."
            />
          </div>
        </Card>

        <Card title="Branding">
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageField
              label="Logo"
              hint="Small round logo in the header and footer."
              value={value.logo}
              onChange={(img) => patch({ logo: img.src })}
            />
            <ImageField
              label="Emblem"
              hint="Large emblem on the home and About pages."
              value={value.emblem}
              onChange={(img) => patch({ emblem: img.src })}
            />
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {value.pillars.map((pillar, i) => (
              <Field key={i} label={`Tagline word ${i + 1}`} hint={i === 0 ? "The three words under the name, e.g. Education · Character · Community." : undefined}>
                <TextInput
                  value={pillar}
                  onChange={(e) => patch({ pillars: value.pillars.map((p, j) => (j === i ? e.target.value : p)) })}
                />
              </Field>
            ))}
          </div>
          <Field label="Footer text" className="mt-5">
            <TextArea rows={3} value={value.footerBlurb} onChange={(e) => patch({ footerBlurb: e.target.value })} />
          </Field>
        </Card>
      </div>
      <SaveBar state={state} pending={pending} />
    </form>
  );
}
