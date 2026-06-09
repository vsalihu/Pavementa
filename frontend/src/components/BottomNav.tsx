"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "./navigation";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 py-2 shadow-lg shadow-slate-900/10 lg:hidden">
      <div className="grid grid-cols-6 gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium transition ${
                isActive
                  ? "bg-emerald-50 text-infrastructure-green"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
