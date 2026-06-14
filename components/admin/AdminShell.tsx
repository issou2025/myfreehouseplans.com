"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.10),transparent_28rem),linear-gradient(180deg,#f8fafc,#eef6fb)] lg:grid lg:grid-cols-[292px_minmax(0,1fr)]">
      <AdminSidebar />
      <div className="min-w-0 max-w-full overflow-x-hidden">
        <AdminHeader />
        <main className="min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
