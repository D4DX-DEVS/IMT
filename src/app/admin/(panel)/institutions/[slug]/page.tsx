import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { InstitutionForm } from "@/components/admin/institution-form";

export const metadata: Metadata = { title: "Edit institution" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

export default async function EditInstitutionPage({ params }: PageProps<"/admin/institutions/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const { institutions } = await readContent();
  const institution = institutions.find((i) => i.slug === slug);
  if (!institution) notFound();

  return (
    <div>
      <Link href="/admin/institutions" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-gold-600">
        <ArrowLeft className="size-4" /> All institutions
      </Link>
      <PageHeader
        title={institution.name}
        description="Edit this institution. Changes appear on the website as soon as you save."
        actions={
          <a
            href={`/institutions/${institution.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-gold-600"
          >
            View on website <ExternalLink className="size-4" />
          </a>
        }
      />
      {/* Re-key on the slug so switching between institutions never reuses another one's form state. */}
      <InstitutionForm key={institution.slug} initial={institution} />
    </div>
  );
}
