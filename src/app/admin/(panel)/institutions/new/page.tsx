import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { InstitutionForm } from "@/components/admin/institution-form";

export const metadata: Metadata = { title: "Add institution" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

export default async function NewInstitutionPage() {
  await requireAdmin();
  return (
    <div>
      <Link href="/admin/institutions" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-gold-600">
        <ArrowLeft className="size-4" /> All institutions
      </Link>
      <PageHeader title="Add institution" description="It appears at the end of the list on the home page and gets its own details page." />
      <InstitutionForm />
    </div>
  );
}
