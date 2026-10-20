"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUp } from "lucide-react";

/** Floating button, bottom-right, that fades in once the page has been scrolled down a screen or so. */
export function BackToTop() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 480));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          title="Back to top"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-5 bottom-5 z-40 grid size-12 place-items-center rounded-full bg-gold-400 text-brand-900 shadow-xl shadow-brand-900/30 ring-1 ring-gold-300 transition-colors hover:bg-gold-300 sm:right-8 sm:bottom-8"
        >
          <ArrowUp className="size-5" strokeWidth={2.25} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
