import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="rounded-md bg-white p-3 text-slate-600 shadow-sm">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Button className="mt-6" href={actionHref}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

