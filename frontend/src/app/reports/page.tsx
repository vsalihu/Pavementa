import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { SeverityBadge } from "@/components/SeverityBadge";

const reports = [
  {
    id: "PV-2041",
    location: "A41 Northbound",
    severity: "critical" as const,
    status: "Pending review",
    date: "2026-06-03",
  },
  {
    id: "PV-2038",
    location: "Mill Road",
    severity: "high" as const,
    status: "Assigned",
    date: "2026-06-02",
  },
  {
    id: "PV-2035",
    location: "Station Approach",
    severity: "medium" as const,
    status: "Draft report",
    date: "2026-06-01",
  },
  {
    id: "PV-2031",
    location: "Westgate Avenue",
    severity: "low" as const,
    status: "Closed",
    date: "2026-05-29",
  },
];

export default function ReportsPage() {
  return (
    <AppShell>
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Report registry
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Mock inspection records prepared for future backend integration.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Report ID</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr className="hover:bg-slate-50" key={report.id}>
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {report.id}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{report.location}</td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={report.severity} />
                  </td>
                  <td className="px-6 py-4 text-slate-700">{report.status}</td>
                  <td className="px-6 py-4 text-slate-500">{report.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

