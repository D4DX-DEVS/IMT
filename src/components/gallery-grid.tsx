"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

type Photo = { src: string; width: number; height: number; alt: string };

const ease = [0.22, 1, 0.36, 1] as const;

export function GalleryGrid({ photos }: { photos: readonly Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(0);

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (step: number) => {
      setDir(step);
      setIndex((i) => (i === null ? i : (i + step + photos.length) % photos.length));
    },
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, go]);

  const current = index === null ? null : photos[index];

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {photos.map((p, i) => (
          <motion.button
            key={p.src}
            type="button"
            onClick={() => {
              setDir(0);
              setIndex(i);
            }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease }}
            className="group relative mb-5 block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-brand-100 shadow-lg shadow-brand-900/5 ring-1 ring-brand-100 break-inside-avoid"
            aria-label={`Open photo: ${p.alt}`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              width={p.width}
              height={p.height}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-auto w-full transition duration-[1.1s] ease-out group-hover:scale-110 group-hover:rotate-1"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-900/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="absolute inset-x-0 bottom-0 flex translate-y-4 items-end justify-between gap-4 p-5 text-left text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="font-display text-lg leading-snug">{p.alt}</span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-400 text-brand-900">
                <Expand className="size-4" />
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col bg-brand-950/95 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            onClick={close}
          >
            <div className="flex items-center justify-between p-4 text-white/80 sm:p-6">
              <span className="font-mono text-sm tabular-nums">
                {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:rotate-90 hover:bg-white/20"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-20">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={current.src}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: d * 120, scale: d === 0 ? 0.92 : 1 }),
                    center: { opacity: 1, x: 0, scale: 1 },
                    exit: (d: number) => ({ opacity: 0, x: d * -120 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    else if (info.offset.x > 80) go(-1);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative h-full max-h-[75vh] w-full max-w-6xl"
                >
                  <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain select-none" draggable={false} />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-3 grid size-12 place-items-center rounded-full bg-white/10 text-white transition hover:-translate-x-0.5 hover:bg-gold-400 hover:text-brand-900 sm:left-6"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Next photo"
                className="absolute right-3 grid size-12 place-items-center rounded-full bg-white/10 text-white transition hover:translate-x-0.5 hover:bg-gold-400 hover:text-brand-900 sm:right-6"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>

            <p className="p-6 text-center font-display text-lg text-white">{current.alt}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
