import type { Metadata } from "next";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { SiteForm } from "@/components/admin/site-form";

export const metadata: Metadata = { title: "Site settings" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

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
