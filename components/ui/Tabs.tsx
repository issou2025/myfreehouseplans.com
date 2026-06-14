"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  label: string;
  content: ReactNode;
};

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-1.5 shadow-sm">
        <div className="flex w-max min-w-full gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActive(index)}
            className={cn("focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold transition", active === index ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950")}
          >
            {tab.label}
          </button>
        ))}
        </div>
      </div>
      <div className="pt-6">{tabs[active]?.content}</div>
    </div>
  );
}
