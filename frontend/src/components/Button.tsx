import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-infrastructure-green text-white shadow-sm hover:bg-[#17794f] focus-visible:ring-infrastructure-green",
  secondary:
    "border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300",
  ghost:
    "text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-300",
};

export function Button({
  children,
  className = "",
  href,
  variant = "primary",
  ...props
}: ButtonProps) {
  const baseClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const buttonClass = `${baseClass} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link className={buttonClass} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
}

