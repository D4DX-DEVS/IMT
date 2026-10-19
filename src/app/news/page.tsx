import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MessageCircle } from "lucide-react";
import { posts } from "@/data/site";
import { PageHero } from "@/components/page-hero";
import { Stagger, StaggerItem } from "@/components/reveal";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "News",
  description: "News and updates from the Islamic Mission Trust.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero title="News" eyebrow="Updates" crumbs={[{ label: "Home", href: "/" }, { label: "News" }]} />
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <Stagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <StaggerItem key={post.slug}>
                <Link
                  href={`/news/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-brand-900/5 ring-1 ring-brand-100 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:ring-gold-300"
                >
                  <div className="relative h-44 overflow-hidden bg-brand-800 bg-pattern">
                    <span className="absolute -right-10 -bottom-10 size-40 rounded-full bg-gold-400/30 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                    <span className="absolute top-5 left-5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur">
                      {post.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-center gap-4 text-xs text-ink/55">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" /> {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="size-3.5" /> {post.comments.length}
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-brand-800 transition-colors group-hover:text-brand-600">
                      {post.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-ink/65">{post.content[0]}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-brand-700">
                      Read more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
