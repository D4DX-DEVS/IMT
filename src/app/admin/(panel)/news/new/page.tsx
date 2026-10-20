import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Write a post" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

export default async function NewPostPage() {
  await requireAdmin();
  // `requireAdmin` has already made this a request-time render, so reading the clock is fine.
  const now = new Date().toISOString().slice(0, 16);
  return (
    <div>
      <Link href="/admin/news" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-gold-600">
        <ArrowLeft className="size-4" /> All posts
      </Link>
      <PageHeader title="Write a post" description="It appears on the News page as soon as you publish." />
      <PostForm defaultDate={now} />
    </div>
  );
}
