import { MapPinned } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";

export default function MapPage() {
  return (
    <AppShell>
      <Card className="p-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Road condition map
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Future spatial interface for road damage, severity, and case
              locations.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            Mapbox integration planned
          </span>
        </div>
        <EmptyState
          description="The map canvas will be connected after damage records and geolocation data are available."
          icon={MapPinned}
          title="GIS layer not connected yet"
        />
      </Card>
    </AppShell>
  );
}

