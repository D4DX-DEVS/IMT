import type { Metadata } from "next";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { HomeForm } from "@/components/admin/home-form";

export const metadata: Metadata = { title: "Home page" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

export default async function HomeEditorPage() {
  await requireAdmin();
  const content = await readContent();
  return (
    <div>
      <PageHeader title="Home page" description="Edit the text and photos shown on the home page." />
      <HomeForm initial={content.home} />
    </div>
  );
}
