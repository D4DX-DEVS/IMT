import type { Metadata } from "next";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { GalleryForm } from "@/components/admin/gallery-form";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryAdminPage() {
  await requireAdmin();
  const { gallery } = await readContent();
  return (
    <div>
      <PageHeader title="Gallery" description="The photos on the public Gallery page. Add, describe, reorder or remove them." />
      <GalleryForm initial={gallery} />
    </div>
  );
}
