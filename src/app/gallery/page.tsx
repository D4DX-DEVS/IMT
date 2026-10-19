import type { Metadata } from "next";
import { gallery } from "@/data/site";
import { PageHero } from "@/components/page-hero";
import { GalleryGrid } from "@/components/gallery-grid";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of Islamic Mission Trust institutions and campuses across Kerala.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        title="Gallery"
        eyebrow="Moments & campuses"
        crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-xl text-lg text-ink/65">
              A look at the schools, colleges and campuses of the Islamic Mission Trust. Tap any photo to view it full
              screen.
            </p>
            <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
              {gallery.length} photos
            </span>
          </Reveal>
          <GalleryGrid photos={gallery} />
        </div>
      </section>
    </>
  );
}
