import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition-shadow ${className}`}
    >
      {children}
    </section>
  );
}
