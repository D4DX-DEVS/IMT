"use client";

import { useState } from "react";
import { savePost } from "@/app/admin/actions";
import { slugify, type Post } from "@/content/schema";
import { useSaveForm } from "@/components/admin/use-save-form";
import { Card, Field, SaveBar, TextArea, TextInput } from "@/components/admin/ui";

type Draft = {
  slug: string;
  title: string;
  date: string; // datetime-local value, e.g. 2026-10-19T09:30
  category: string;
  author: string;
  body: string; // paragraphs separated by a blank line
  comments: Post["comments"];
};

const toDraft = (p: Post): Draft => ({
  slug: p.slug,
  title: p.title,
  date: p.date.slice(0, 16),
  category: p.category,
  author: p.author,
  body: p.content.join("\n\n"),
  comments: p.comments,
});

export function PostForm({ initial, defaultDate }: { initial?: Post; defaultDate?: string }) {
  const originalSlug = initial?.slug;
  const [slugTouched, setSlugTouched] = useState(false);
  const { value, patch, state, formAction, pending, payload } = useSaveForm<Draft>(
    initial
      ? toDraft(initial)
      : { slug: "", title: "", date: defaultDate ?? "", category: "News", author: "Admin", body: "", comments: [] },
    savePost,
    (d) => ({
      originalSlug,
      post: {
        slug: d.slug,
        title: d.title,
        date: d.date.length === 16 ? `${d.date}:00` : d.date,
        category: d.category,
        author: d.author,
        content: d.body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
        comments: d.comments,
      },
    }),
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={payload} />
      <div className="space-y-6">
        <Card title="Post">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <TextInput
                value={value.title}
                onChange={(e) => patch({ title: e.target.value, ...(!originalSlug && !slugTouched ? { slug: slugify(e.target.value) } : {}) })}
              />
            </Field>
            <Field label="Date and time" hint="Shown on the post and used to order the news list.">
              <TextInput type="datetime-local" value={value.date} onChange={(e) => patch({ date: e.target.value })} />
            </Field>
            <Field label="Category">
              <TextInput value={value.category} onChange={(e) => patch({ category: e.target.value })} />
            </Field>
            <Field label="Author">
              <TextInput value={value.author} onChange={(e) => patch({ author: e.target.value })} />
            </Field>
            <Field
              label="Page address"
              hint={originalSlug ? "Fixed after publishing, so existing links keep working." : "Used in the link to this post. Filled in from the title."}
            >
              <div className="flex items-center overflow-hidden rounded-xl border border-brand-200 bg-white shadow-sm focus-within:border-azure-500 focus-within:ring-2 focus-within:ring-azure-500/20">
                <span className="bg-brand-50 px-3 py-2.5 text-sm text-ink/50">/news/</span>
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

        <Card title="Content" description="Leave a blank line between paragraphs.">
          <TextArea aria-label="Post content" rows={14} value={value.body} onChange={(e) => patch({ body: e.target.value })} />
          {value.comments.length > 0 && (
            <p className="mt-3 text-xs text-ink/50">This post has {value.comments.length} existing comment{value.comments.length === 1 ? "" : "s"}, which are kept.</p>
          )}
        </Card>
      </div>
      <SaveBar state={state} pending={pending} label={originalSlug ? "Save changes" : "Publish post"} />
    </form>
  );
}
