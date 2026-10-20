import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Edit post" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

export default async function EditPostPage({ params }: PageProps<"/admin/news/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const { posts } = await readContent();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div>
      <Link href="/admin/news" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-gold-600">
        <ArrowLeft className="size-4" /> All posts
      </Link>
      <PageHeader
        title={post.title}
        description="Edit this post. Changes appear on the website as soon as you save."
        actions={
          <a href={`/news/${post.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-gold-600">
            View on website <ExternalLink className="size-4" />
          </a>
        }
      />
      <PostForm key={post.slug} initial={post} />
    </div>
  );
}
