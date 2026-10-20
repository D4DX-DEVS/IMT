import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import type { HomeContent } from "@/content/schema";
import { SectionHeading } from "@/components/section-heading";
import { Stagger, StaggerItem } from "@/components/reveal";
import { cn } from "@/lib/cn";

export function GalleryTeaser({ photos }: { photos: HomeContent["campusLife"] }) {
  return (
    <section className="py-24 sm:py-28">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Campus life"
            title="Life Across Our Campuses"
            intro="Vibrant campuses, inspired learning environments and a community that grows together."
            align="left"
          />
          <Link
            href="/gallery"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-brand-200 bg-white px-6 py-3 font-bold text-brand-800 transition hover:border-brand-800 hover:bg-brand-800 hover:text-white"
          >
            View Gallery
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Stagger className="mt-12 grid auto-rows-[170px] grid-cols-2 gap-4 sm:auto-rows-[190px] md:grid-cols-4 lg:auto-rows-[210px]">
          {photos.map((p, i) => (
            <StaggerItem key={p.src} className={cn(i === 0 && "col-span-2 row-span-2")}>
              <Link
                href="/gallery"
                className="group relative block size-full overflow-hidden rounded-2xl bg-brand-100 shadow-lg shadow-brand-900/10"
                aria-label={`${p.caption} — view gallery`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  className="object-cover transition duration-[1.1s] ease-out group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-transparent transition-opacity duration-500" />
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 sm:inset-x-4 sm:bottom-4",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center gap-2 font-semibold text-white",
                      i === 0 ? "text-sm" : "text-xs leading-snug sm:text-sm",
                    )}
                  >
                    <ImageIcon className={cn("size-4 shrink-0 text-gold-300", i !== 0 && "hidden sm:block")} />
                    {p.caption}
                  </span>
                  <span
                    className={cn(
                      "size-9 shrink-0 place-items-center rounded-full bg-white text-brand-800 shadow-lg transition duration-300 group-hover:translate-x-1 group-hover:bg-gold-400",
                      i === 0 ? "grid" : "hidden sm:grid",
                    )}
                  >
                    <ArrowRight className="size-4" />
                  </span>
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
