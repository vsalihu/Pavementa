import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Organisation profile
          </h2>
          <div className="mt-6 space-y-5">
            <div>
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="organisation"
              >
                Organisation name
              </label>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                id="organisation"
                placeholder="Example: Northshire Council"
                type="text"
              />
            </div>
            <div>
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="email"
              >
                Contact email
              </label>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                id="email"
                placeholder="infrastructure@example.gov.uk"
                type="email"
              />
            </div>
          </div>
          <Button className="mt-6">Save settings</Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Notification preferences
          </h2>
          <div className="mt-6 space-y-4">
            {[
              "Critical severity alerts",
              "Weekly inspection digest",
              "Report export completion",
            ].map((item) => (
              <label
                className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
                key={item}
              >
                <span className="text-sm font-medium text-slate-700">
                  {item}
                </span>
                <input
                  className="h-4 w-4 accent-infrastructure-green"
                  defaultChecked
                  type="checkbox"
                />
              </label>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

