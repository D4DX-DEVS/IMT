import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Suspense fallback={<SidebarPlaceholder />}>
        <AdminSidebar />
      </Suspense>
      <div className="min-w-0 flex-1">
        <Suspense fallback={<PanelLoading />}>
          <Gate>{children}</Gate>
        </Suspense>
      </div>
    </div>
  );
}

/** Reads the session (a request-time API), so it lives inside the Suspense boundary above. */
async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="mx-auto w-full max-w-5xl px-4 pt-8 pb-0 sm:px-8 sm:pt-10">{children}</div>;
}

/** Same footprint as the sidebar, so nothing jumps when it streams in. */
function SidebarPlaceholder() {
  return (
    <>
      <aside aria-hidden className="sticky top-0 hidden h-dvh w-64 shrink-0 bg-brand-900 lg:block" />
      <header aria-hidden className="h-[3.75rem] bg-brand-900 lg:hidden" />
    </>
  );
}

function PanelLoading() {
  return (
    <p className="flex items-center gap-2 p-10 text-sm text-ink/55">
      <Loader2 className="size-4 animate-spin" /> Loading…
    </p>
  );
}
