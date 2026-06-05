"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { homeNavItem, navigationItems } from "./navigation";

export function Sidebar() {
  const pathname = usePathname();
  const items = [homeNavItem, ...navigationItems];

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-navy px-5 py-6 text-white lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-infrastructure-green text-white">
          <ShieldCheck aria-hidden="true" className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-semibold">Pavementa</p>
          <p className="text-xs text-slate-300">Road Intelligence</p>
        </div>
      </Link>

      <nav className="mt-9 space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-navy"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
              href={item.href}
              key={item.href}
            >
              <span className="flex items-center gap-3">
                <Icon aria-hidden="true" className="h-4 w-4" />
                {item.label}
              </span>
              {isActive ? (
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold">Council workspace</p>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          Mock operational interface for inspections, reporting, and road
          condition triage.
        </p>
      </div>
    </aside>
  );
}

