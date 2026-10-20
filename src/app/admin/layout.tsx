import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s – Admin" },
  robots: { index: false, follow: false },
};

/** The admin area has its own look and none of the public site's header or footer. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh flex-1 bg-brand-50/70 text-ink">{children}</div>;
}
