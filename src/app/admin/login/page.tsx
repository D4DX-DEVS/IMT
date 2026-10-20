import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { adminConfigProblems } from "@/lib/auth-token";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-brand-950 px-5 py-12">
      <div className="absolute inset-0 -z-10 bg-pattern opacity-70" />
      <div className="absolute top-1/2 left-1/2 -z-10 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/30 blur-3xl" />

      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <span className="relative mx-auto block size-20 overflow-hidden rounded-full bg-white ring-4 ring-gold-400/60">
            <Image src="/images/logo.png" alt="" fill sizes="80px" className="object-contain" loading="eager" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold">Admin panel</h1>
          <p className="mt-1.5 text-sm text-white/65">Sign in to manage the website content.</p>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">
          <Suspense fallback={<div className="h-64" />}>
            <LoginScreen searchParams={searchParams} />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-gold-300">
            <ArrowLeft className="size-4" /> Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}

async function LoginScreen({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { next } = await searchParams;
  if (await isAdmin()) redirect("/admin");

  const problems = adminConfigProblems();
  if (problems.length) {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
        <ShieldAlert className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-semibold">Sign-in isn’t set up correctly on this server yet.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
          <p className="mt-2">
            Fix it in the environment (<code className="font-semibold">.env.local</code> or <code className="font-semibold">.env</code>,
            see <code className="font-semibold">.env.example</code>), then restart.
          </p>
        </div>
      </div>
    );
  }

  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}
