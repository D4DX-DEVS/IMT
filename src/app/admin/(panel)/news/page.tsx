import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { deletePost } from "@/app/admin/actions";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { PageHeader } from "@/components/admin/ui";
import { buttonClass } from "@/components/admin/styles";

export const metadata: Metadata = { title: "News" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

export default async function NewsAdminPage() {
  await requireAdmin();
  const { posts } = await readContent();
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="pb-12">
      <PageHeader
        title="News"
        description="Posts shown on the public News page, newest first."
        actions={
          <Link href="/admin/news/new" className={buttonClass("primary")}>
            <Plus className="size-4" /> Write a post
          </Link>
        }
      />

      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-brand-100">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Newspaper className="size-6" />
          </span>
          <p className="mt-4 font-extrabold text-brand-900">No posts yet</p>
          <p className="mt-1 text-sm text-ink/55">Publish your first news post and it will appear on the News page.</p>
          <Link href="/admin/news/new" className={buttonClass("primary", "mt-6")}>
            <Plus className="size-4" /> Write a post
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((post) => (
            <li key={post.slug} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-100 sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold text-brand-900">{post.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink/55">
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">{post.category}</span>
                  <span>{formatDate(post.date)}</span>
                  <span>· {post.author}</span>
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                <a
                  href={`/news/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${post.title} on the website`}
                  title="View on the website"
                  className="grid size-9 place-items-center rounded-lg text-ink/55 ring-1 ring-brand-200 transition hover:bg-brand-50 hover:text-brand-800"
                >
                  <ExternalLink className="size-4" />
                </a>
                <Link href={`/admin/news/${post.slug}`} className={buttonClass("secondary", "px-3.5 py-2")}>
                  <Pencil className="size-4" /> Edit
                </Link>
                <ConfirmAction
                  action={deletePost}
                  arg={post.slug}
                  confirmText={`Delete “${post.title}”? It can’t be undone.`}
                  className="px-3.5 py-2"
                  label={`Delete ${post.title}`}
                >
                  <Trash2 className="size-4" /> Delete
                </ConfirmAction>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
