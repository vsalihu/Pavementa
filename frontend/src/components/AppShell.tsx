import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="px-5 pb-28 pt-6 sm:px-8 lg:pb-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}

