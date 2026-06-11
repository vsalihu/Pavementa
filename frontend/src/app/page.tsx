import {
  ArrowRight,
  BarChart3,
  FileText,
  MapPinned,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

const features = [
  {
    title: "AI-assisted surface review",
    description:
      "Prepare road images for automated pothole and crack detection workflows.",
    icon: UploadCloud,
  },
  {
    title: "Council-ready reporting",
    description:
      "Turn inspection evidence into structured records and future export packs.",
    icon: FileText,
  },
  {
    title: "Spatial intelligence",
    description:
      "Plan future Mapbox views around severity, location, and network priority.",
    icon: MapPinned,
  },
  {
    title: "Operational dashboards",
    description:
      "Track road health, critical defects, open cases, and inspection velocity.",
    icon: BarChart3,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy text-white">
              <ShieldCheck aria-hidden="true" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Pavementa</p>
              <p className="text-xs font-medium text-slate-500">
                Road Intelligence for Modern Cities
              </p>
            </div>
          </div>
          <Button href="/dashboard" variant="secondary">
            Open dashboard
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(31,143,95,0.22),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Civic infrastructure intelligence
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Pavementa
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              A professional platform for councils and contractors to assess
              road surface damage, prioritise interventions, and prepare
              evidence-led maintenance reports.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/dashboard">
                View operational dashboard
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button href="/reports" variant="secondary">
                Review damage registry
              </Button>
              <Button href="/public/report" variant="secondary">
                Public reporting
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/8 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="rounded-md bg-white p-5 text-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Network condition
                  </p>
                  <p className="mt-1 text-3xl font-semibold">82.4</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Stable
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {["A41 Northbound", "Mill Road", "Station Approach"].map(
                  (road, index) => (
                    <div
                      className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
                      key={road}
                    >
                      <div>
                        <p className="text-sm font-semibold">{road}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {index + 2} defects awaiting review
                        </p>
                      </div>
                      <div className="h-2 w-24 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-safety-amber"
                          style={{ width: `${72 - index * 14}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-infrastructure-green">
              The problem
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Road condition evidence is often fragmented, slow to review, and
              difficult to prioritise.
            </h2>
          </div>
          <p className="text-base leading-8 text-slate-600">
            Inspection teams need a dependable way to capture road imagery,
            classify surface damage, connect defects to locations, and turn
            findings into reports that support budget decisions, contractor
            workflows, and public accountability.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-infrastructure-green">
            The solution
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            A focused operating system for road damage intelligence.
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Pavementa brings future AI detection, damage registries, GIS
            mapping, and reporting into one professional workspace designed for
            civic infrastructure teams.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card className="p-5" key={feature.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-infrastructure-green">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
