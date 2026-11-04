import type { Metadata } from "next";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { SiteForm } from "@/components/admin/site-form";

export const metadata: Metadata = { title: "Site settings" };

export default async function SiteSettingsPage() {
  await requireAdmin();
  const { site } = await readContent();
  return (
    <div>
      <PageHeader title="Site settings" description="Name, contact details and branding used across the whole website." />
      <SiteForm initial={site} />
    </div>
  );
}
