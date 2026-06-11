import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
};

export function SelectField({
  label,
  id,
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? props.name ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="block" htmlFor={selectId}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        className={`mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-infrastructure-green focus:ring-2 focus:ring-infrastructure-green/15 ${className}`}
        id={selectId}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
