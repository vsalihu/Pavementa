import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  message?: string;
  className?: string;
};

export function LoadingState({
  message = "Loading data...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex min-h-32 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 ${className}`}
      role="status"
    >
      <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
      {message}
    </div>
  );
}
