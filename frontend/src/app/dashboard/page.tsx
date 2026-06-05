import {
  Activity,
  AlertTriangle,
  ClipboardCheck,
  FileText,
  Gauge,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatCard } from "@/components/StatCard";

const activity = [
  "Inspection batch PV-2041 added for North Ward",
  "Critical pothole flagged on A41 Northbound",
  "Three cases moved to contractor review",
  "Report export prepared for Mill Road cluster",
];

const priorityAreas = [
  { area: "A41 Northbound", severity: "critical" as const, cases: 8 },
  { area: "Mill Road", severity: "high" as const, cases: 5 },
  { area: "Station Approach", severity: "medium" as const, cases: 3 },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          helper="Across current mock inspection set"
          icon={FileText}
          label="Total reports"
          value="148"
        />
        <StatCard
          helper="Require immediate operational review"
          icon={AlertTriangle}
          label="Critical issues"
          tone="red"
          value="12"
        />
        <StatCard
          helper="Composite condition index"
          icon={Gauge}
          label="Average road health"
          tone="green"
          value="82.4"
        />
        <StatCard
          helper="Awaiting inspector confirmation"
          icon={ClipboardCheck}
          label="Pending review"
          tone="amber"
          value="27"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest operational events across the inspection workspace.
              </p>
            </div>
            <Activity aria-hidden="true" className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-6 space-y-4">
            {activity.map((item) => (
              <div
                className="flex items-start gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                key={item}
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-infrastructure-green" />
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Priority areas
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Mock locations sorted by severity and open cases.
          </p>
          <div className="mt-6 space-y-4">
            {priorityAreas.map((area) => (
              <div
                className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
                key={area.area}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {area.area}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {area.cases} open cases
                  </p>
                </div>
                <SeverityBadge severity={area.severity} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

