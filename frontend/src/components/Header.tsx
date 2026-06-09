"use client";

import { Bell, Search, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; eyebrow: string }> = {
  "/": {
    title: "Pavementa",
    eyebrow: "Road Intelligence for Modern Cities",
  },
  "/dashboard": {
    title: "Operational Dashboard",
    eyebrow: "Network condition overview",
  },
  "/upload": {
    title: "Image Intake",
    eyebrow: "Prepare road imagery for AI review",
  },
  "/results": {
    title: "Detection Results",
    eyebrow: "Prototype analysis review",
  },
  "/reports": {
    title: "Damage Reports",
    eyebrow: "Inspection records and council-ready outputs",
  },
  "/map": {
    title: "GIS Map",
    eyebrow: "Spatial view of road condition intelligence",
  },
  "/settings": {
    title: "Organisation Settings",
    eyebrow: "Workspace configuration",
  },
};

export function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? pageTitles["/dashboard"];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-infrastructure-green">
            {page.eyebrow}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">
            {page.title}
          </h1>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex h-10 min-w-72 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            <Search aria-hidden="true" className="h-4 w-4" />
            Search reports, roads, cases
          </div>
          <button
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <Bell aria-hidden="true" className="h-4 w-4" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy text-white">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
