import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormField } from "@/components/FormField";
import { PageHeader } from "@/components/PageHeader";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Workspace configuration"
          title="Organisation Settings"
          description="Manage the organisation profile and operational notification preferences for the Pavementa workspace."
        />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Organisation profile
          </h2>
          <div className="mt-6 space-y-5">
            <FormField
              id="organisation"
              label="Organisation name"
              placeholder="Example: Northshire Council"
              type="text"
            />
            <FormField
              id="email"
              label="Contact email"
              placeholder="infrastructure@example.gov.uk"
              type="email"
            />
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
      </div>
    </AppShell>
  );
}
