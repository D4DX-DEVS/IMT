import type { Metadata } from "next";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { AboutForm } from "@/components/admin/about-form";

export const metadata: Metadata = { title: "About page" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

export default async function AboutEditorPage() {
  await requireAdmin();
  const content = await readContent();
  return (
    <div>
      <PageHeader title="About page" description="Edit the text and photos shown on the about page." />
      <AboutForm initial={content.aboutPage} />
    </div>
  );
}
