import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gallery } from "@/data/site";
import { SectionHeading } from "@/components/section-heading";
import { Stagger, StaggerItem } from "@/components/reveal";

export function GalleryTeaser() {
  const photos = gallery.slice(0, 5);
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading eyebrow="Gallery" title="Life across our campuses" align="left" />
          <Link
            href="/gallery"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-brand-200 px-6 py-3 font-semibold text-brand-700 transition hover:border-brand-700 hover:bg-brand-700 hover:text-white"
          >
            View full gallery
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Stagger className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-4 md:auto-rows-[220px] md:grid-cols-4">
          {photos.map((p, i) => (
            <StaggerItem
              key={p.src}
              className={i === 0 ? "col-span-2 row-span-2" : i === 2 ? "row-span-2" : ""}
            >
              <Link
                href="/gallery"
                className="group relative block size-full overflow-hidden rounded-2xl bg-brand-100"
                aria-label={p.alt}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-[1.1s] ease-out group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-brand-950/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute bottom-4 left-4 right-4 translate-y-3 font-display text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {p.alt}
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
