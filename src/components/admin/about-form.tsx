"use client";

import { saveAbout } from "@/app/admin/actions";
import type { AboutPageContent } from "@/content/schema";
import { listOps, useSaveForm } from "@/components/admin/use-save-form";
import { AddButton, Card, Field, RowControls, SaveBar, StringListEditor, TextInput } from "@/components/admin/ui";

export function AboutForm({ initial }: { initial: AboutPageContent }) {
  const { value, patch, state, formAction, pending, payload } = useSaveForm(initial, saveAbout);
  const { milestones } = value;

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />
      <div className="space-y-6">
        <Card title="Our story" description="The main text at the top of the About page.">
          <div className="space-y-5">
            <Field label="Heading">
              <TextInput value={value.heading} onChange={(e) => patch({ heading: e.target.value })} />
            </Field>
            <StringListEditor
              label="Paragraphs"
              itemLabel="Paragraph"
              multiline
              values={value.paragraphs}
              onChange={(paragraphs) => patch({ paragraphs })}
              max={8}
              addLabel="Add paragraph"
            />
          </div>
        </Card>

        <Card
          title="Milestones"
          description="The timeline further down the About page."
          actions={milestones.length < 12 ? <AddButton onClick={() => patch({ milestones: [...milestones, { year: "", text: "" }] })}>Add milestone</AddButton> : undefined}
        >
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl bg-brand-50/60 p-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-[9rem_1fr]">
                  <TextInput
                    aria-label={`Milestone ${i + 1} year`}
                    placeholder="Year or label"
                    value={m.year}
                    onChange={(e) => patch({ milestones: listOps.replace(milestones, i, { ...m, year: e.target.value }) })}
                  />
                  <TextInput
                    aria-label={`Milestone ${i + 1} text`}
                    placeholder="What happened"
                    value={m.text}
                    onChange={(e) => patch({ milestones: listOps.replace(milestones, i, { ...m, text: e.target.value }) })}
                  />
                </div>
                <RowControls
                  index={i}
                  count={milestones.length}
                  onMove={(d) => patch({ milestones: listOps.move(milestones, i, d) })}
                  onRemove={() => patch({ milestones: listOps.remove(milestones, i) })}
                  canRemove={milestones.length > 1}
                  removeLabel="Remove milestone"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Mission" description="The full statement shown on the About page.">
          <StringListEditor
            label="Paragraphs"
            itemLabel="Mission paragraph"
            multiline
            values={value.mission}
            onChange={(mission) => patch({ mission })}
            max={4}
            addLabel="Add paragraph"
          />
        </Card>

        <Card title="Vision" description="The full statement shown on the About page.">
          <StringListEditor
            label="Paragraphs"
            itemLabel="Vision paragraph"
            multiline
            values={value.vision}
            onChange={(vision) => patch({ vision })}
            max={4}
            addLabel="Add paragraph"
          />
        </Card>
      </div>
      <SaveBar state={state} pending={pending} />
    </form>
  );
}
