import type { TextareaHTMLAttributes } from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helper?: string;
};

export function TextArea({ label, helper, id, className = "", ...props }: TextAreaProps) {
  const textareaId = id ?? props.name ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="block" htmlFor={textareaId}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        className={`mt-2 min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-infrastructure-green focus:ring-2 focus:ring-infrastructure-green/15 ${className}`}
        id={textareaId}
        {...props}
      />
      {helper ? <span className="mt-1 block text-xs leading-5 text-slate-500">{helper}</span> : null}
    </label>
  );
}
