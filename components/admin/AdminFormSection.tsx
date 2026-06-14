import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function AdminFormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card className="p-4 hover:shadow-[0_24px_80px_rgba(15,23,42,0.09)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      <div className="grid gap-5">{children}</div>
    </Card>
  );
}
