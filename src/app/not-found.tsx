import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden bg-brand-950 pt-32 pb-20 text-white">
      <div className="absolute inset-0 -z-10 bg-pattern opacity-70" />
      <div className="absolute top-1/2 left-1/2 -z-10 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="container-x text-center">
        <p className="font-display text-[8rem] leading-none font-semibold text-gold-300/90 sm:text-[12rem]">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-white/70">
          The page you are looking for doesn’t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-4 font-semibold text-brand-900 transition hover:-translate-y-0.5 hover:bg-gold-300"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back to home
        </Link>
      </div>
    </section>
  );
}
