import type { Metadata } from "next";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { HomeForm } from "@/components/admin/home-form";

export const metadata: Metadata = { title: "Home page" };

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
