import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, FileText, Home, Images, Newspaper, Settings, type LucideIcon } from "lucide-react";
import { contentLastSaved, readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { explainStorageError, getStore } from "@/storage";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { StorageCheck } from "@/components/admin/storage-check";

export const metadata: Metadata = { title: "Dashboard" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

const sections: { href: string; label: string; text: string; icon: LucideIcon }[] = [
  { href: "/admin/site", label: "Site settings", text: "Name, motto, address, phone, email, logo and footer text.", icon: Settings },
  { href: "/admin/home", label: "Home page", text: "Hero, numbers, about text, mission & vision and campus photos.", icon: Home },
  { href: "/admin/about", label: "About page", text: "The story, milestones, and the full mission and vision.", icon: FileText },
  { href: "/admin/institutions", label: "Institutions", text: "Add, edit, reorder and remove schools, colleges and centres.", icon: Building2 },
  { href: "/admin/gallery", label: "Gallery", text: "Upload photos, write descriptions and reorder them.", icon: Images },
  { href: "/admin/news", label: "News", text: "Publish and edit news posts.", icon: Newspaper },
];

export default async function DashboardPage() {
  await requireAdmin();

  let storageProblem: string | null = null;
  let storageDescription = "";
  let usingLocalDisk = false;
  let content: Awaited<ReturnType<typeof readContent>> | null = null;
  let saved: Date | null = null;
  try {
    const store = getStore();
    storageDescription = store.description;
    usingLocalDisk = store.kind === "local";
    [content, saved] = await Promise.all([readContent(), contentLastSaved()]);
  } catch (error) {
    storageProblem =
      error instanceof Error && error.message.startsWith("DigitalOcean Spaces is only partly") ? error.message : explainStorageError(error);
  }

  const stats = content && [
    { label: "Institutions", value: content.institutions.length, href: "/admin/institutions" },
    { label: "Gallery photos", value: content.gallery.length, href: "/admin/gallery" },
    { label: "News posts", value: content.posts.length, href: "/admin/news" },
  ];

  return (
    <div className="pb-12">
      <PageHeader
        title="Dashboard"
        description="Everything on the public website is edited here. Changes go live as soon as you save."
        actions={
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-800 ring-1 ring-brand-200 transition hover:bg-brand-50"
          >
            View website <ArrowRight className="size-4" />
          </a>
        }
      />

      {storageProblem && (
        <div className="mb-8">
          <Notice tone="error">
            <p className="font-semibold">The site’s storage can’t be reached, so nothing can be loaded or saved yet.</p>
            <p className="mt-1">{storageProblem}</p>
          </Notice>
        </div>
      )}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-gold-300"
              >
                <p className="font-display text-4xl font-semibold text-brand-800">{s.value}</p>
                <p className="mt-1 text-sm font-semibold text-ink/60">{s.label}</p>
              </Link>
            ))}
          </div>

          <p className="mt-4 text-sm text-ink/55">
            {saved
              ? `Last saved ${saved.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.`
              : "Nothing has been saved yet — the site is showing its starting content."}
          </p>
        </>
      )}

      <h2 className="mt-10 mb-4 text-sm font-extrabold tracking-[0.18em] text-brand-700 uppercase">Edit</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ href, label, text, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-gold-300"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-gold-400 group-hover:text-brand-900">
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block font-extrabold text-brand-900">{label}</span>
              <span className="mt-0.5 block text-sm text-ink/60">{text}</span>
            </span>
          </Link>
        ))}
      </div>

      <Card
        title="Storage"
        description="Where the content, backups and uploaded images are kept."
        className="mt-10"
      >
        {storageDescription && <p className="mb-4 text-sm font-semibold text-brand-800">{storageDescription}</p>}
        {usingLocalDisk && process.env.NODE_ENV === "production" && (
          <div className="mb-4">
            <Notice tone="warning">
              <p className="font-semibold">Using the server’s local disk.</p>
              <p className="mt-1">
                On DigitalOcean App Platform the disk is erased on every deploy, so edits and uploads would be lost. Add the{" "}
                <code className="font-semibold">DO_SPACES_*</code> settings to keep them in a Space.
              </p>
            </Notice>
          </div>
        )}
        {usingLocalDisk && process.env.NODE_ENV !== "production" && (
          <p className="mb-4 text-sm text-ink/60">
            Fine for development. To use DigitalOcean Spaces, set the <code className="font-semibold">DO_SPACES_*</code> variables
            (see <code className="font-semibold">.env.example</code>).
          </p>
        )}
        <StorageCheck />
      </Card>

      <Card title="Good to know" className="mt-6">
        <ul className="list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>Uploaded images are resized to fit within 2400px and stripped of location data automatically.</li>
          <li>The last 30 versions of the content are kept as backups in the same storage.</li>
          <li>The sign-in username and password are set in the server’s environment settings.</li>
        </ul>
      </Card>
    </div>
  );
}
