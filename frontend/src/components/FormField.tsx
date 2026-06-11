import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helper?: string;
};

export function FormField({ label, helper, id, className = "", ...props }: FormFieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className={`mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-infrastructure-green focus:ring-2 focus:ring-infrastructure-green/15 ${className}`}
        id={inputId}
        {...props}
      />
      {helper ? <span className="mt-1 block text-xs leading-5 text-slate-500">{helper}</span> : null}
    </label>
  );
}
