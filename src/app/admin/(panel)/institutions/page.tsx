import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { readContent } from "@/content/store";
import { requireAdmin } from "@/lib/auth";
import { categoryBadge, institutionTitle } from "@/lib/institution";
import { deleteInstitution } from "@/app/admin/actions";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { MoveButtons } from "@/components/admin/move-buttons";
import { PageHeader } from "@/components/admin/ui";
import { buttonClass } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Institutions" };

// Reads the session cookie, so this page can't be prerendered; a loading skeleton covers the wait.
export const instant = false;

export default async function InstitutionsAdminPage() {
  await requireAdmin();
  const { institutions } = await readContent();

  return (
    <div className="pb-12">
      <PageHeader
        title="Institutions"
        description="The schools, colleges and training centres shown on the home page. The first one is the featured card; use the arrows to reorder."
        actions={
          <Link href="/admin/institutions/new" className={buttonClass("primary")}>
            <Plus className="size-4" /> Add institution
          </Link>
        }
      />

      <ul className="space-y-3">
        {institutions.map((inst, i) => (
          <li key={inst.slug} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-3 pr-4 shadow-sm ring-1 ring-brand-100 sm:flex-nowrap">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-sky-wash">
              <Image src={inst.image.src} alt="" fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold text-brand-900">{institutionTitle(inst)}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink/55">
                <span className="rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">{categoryBadge(inst)}</span>
                {i === 0 && <span className="rounded-md bg-gold-100 px-2 py-0.5 font-semibold text-gold-700">Featured</span>}
                <span className="truncate">/institutions/{inst.slug}</span>
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              <MoveButtons slug={inst.slug} first={i === 0} last={i === institutions.length - 1} />
              <a
                href={`/institutions/${inst.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${inst.name} on the website`}
                title="View on the website"
                className="grid size-9 place-items-center rounded-lg text-ink/55 ring-1 ring-brand-200 transition hover:bg-brand-50 hover:text-brand-800"
              >
                <ExternalLink className="size-4" />
              </a>
              <Link href={`/admin/institutions/${inst.slug}`} className={buttonClass("secondary", "px-3.5 py-2")}>
                <Pencil className="size-4" /> Edit
              </Link>
              <ConfirmAction
                action={deleteInstitution}
                arg={inst.slug}
                confirmText={`Delete “${inst.name}”? This removes its page and its photo (if uploaded). It can’t be undone.`}
                className="px-3.5 py-2"
                label={`Delete ${inst.name}`}
              >
                <Trash2 className="size-4" /> Delete
              </ConfirmAction>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
