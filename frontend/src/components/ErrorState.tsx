import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message: string;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-red-800 ${className}`}
      role="alert"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6">{message}</p>
      </div>
    </div>
  );
}
