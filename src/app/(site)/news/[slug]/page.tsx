import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Tag, User } from "lucide-react";
import { getContent } from "@/content";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { posts } = await getContent();
  const post = posts.find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.content[0] } : {};
}

// Posts are added in the admin panel at any time, so their slugs aren't known at build time and
// each page renders on first request. This opts out of the dev-time "instant navigation" check.
export const instant = false;

export default async function PostPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const { posts } = await getContent();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <PageHero
        title={post.title}
        eyebrow={post.category}
        crumbs={[{ label: "Home", href: "/" }, { label: "News", href: "/news" }, { label: post.title }]}
      />
      <article className="py-20 sm:py-28">
        <div className="container-x max-w-3xl">
          <Reveal className="flex flex-wrap gap-3 text-sm text-ink/60">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 ring-1 ring-brand-100">
              <CalendarDays className="size-4 text-gold-500" /> {formatDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 ring-1 ring-brand-100">
              <User className="size-4 text-gold-500" /> {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 ring-1 ring-brand-100">
              <Tag className="size-4 text-gold-500" /> {post.category}
            </span>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 space-y-5 text-lg leading-relaxed text-ink/80">
            {post.content.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>

          {post.comments.length > 0 && (
            <Reveal delay={0.15} className="mt-16 border-t border-brand-100 pt-10">
              <h2 className="font-display text-2xl font-semibold text-brand-800">
                {post.comments.length === 1 ? "One Response" : `${post.comments.length} Responses`}
              </h2>
              <ul className="mt-6 space-y-5">
                {post.comments.map((c) => (
                  <li key={c.date + c.author} className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-lg font-semibold text-brand-700">
                      {c.author.charAt(0)}
                    </span>
                    <div>
                      <p className="font-semibold text-brand-800">{c.author}</p>
                      <p className="text-xs text-ink/50">{formatDate(c.date, true)}</p>
                      <div className="mt-3 space-y-1 text-ink/75">
                        {c.content.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <Link
            href="/news"
            className="group mt-14 inline-flex items-center gap-2 font-semibold text-brand-700 transition hover:text-gold-600"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back to news
          </Link>
        </div>
      </article>
    </>
  );
}
