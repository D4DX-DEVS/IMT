"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  ExternalLink,
  FileText,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

const items: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Site settings", href: "/admin/site", icon: Settings },
  { label: "Home page", href: "/admin/home", icon: Home },
  { label: "About page", href: "/admin/about", icon: FileText },
  { label: "Institutions", href: "/admin/institutions", icon: Building2 },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "News", href: "/admin/news", icon: Newspaper },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col">
      <ul className="space-y-1">
        {items.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                  active ? "bg-gold-400 text-brand-900 shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-[1.15rem]" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="size-[1.15rem]" /> View website
        </a>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-white/75 transition hover:bg-red-500/20 hover:text-white"
          >
            <LogOut className="size-[1.15rem]" /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
      <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-gold-400/70">
        <Image src="/images/logo.png" alt="" fill sizes="40px" className="object-contain" loading="eager" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-extrabold text-white">IMT Admin</span>
        <span className="block text-[0.65rem] tracking-[0.2em] text-gold-300 uppercase">Content manager</span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 overflow-y-auto bg-brand-900 p-5 lg:flex">
        {brand}
        {nav}
      </aside>

      {/* Mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-brand-900 px-4 py-3 lg:hidden">
        {brand}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="grid size-10 place-items-center rounded-full bg-white/10 text-white"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-[3.75rem] bottom-0 z-30 flex flex-col overflow-y-auto bg-brand-900 p-5 lg:hidden">{nav}</div>
      )}
    </>
  );
}
