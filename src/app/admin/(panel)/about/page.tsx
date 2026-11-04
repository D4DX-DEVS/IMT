import type { Metadata } from "next";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { AboutForm } from "@/components/admin/about-form";

export const metadata: Metadata = { title: "About page" };

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
