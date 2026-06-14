"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const suggestions = [
    ["3 bedrooms", "3 bedrooms"],
    ["20x20m / 66x66 ft plot", "20x20m plot"],
    ["modern low cost", "modern low cost"],
    ["CAD Revit", "CAD Revit"],
    ["terrace", "terrace"]
  ];

  function submitSearch(value = query) {
    const clean = value.trim();
    router.push(clean ? `/plans?q=${encodeURIComponent(clean)}` : "/plans");
  }

  return (
    <div className="max-w-full rounded-2xl border border-white/70 bg-white/95 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur sm:rounded-3xl sm:p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            className="h-12 border-transparent pl-10 shadow-none"
            placeholder="Bedrooms, plot size, style, CAD..."
            aria-label="Search house plans"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitSearch();
            }}
          />
        </div>
        <Button type="button" onClick={() => submitSearch()} className="h-12 w-full sm:w-auto">Search Plans <ArrowRight className="h-4 w-4" /></Button>
      </div>
      <div className="mobile-scroll mt-2 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:max-h-16 sm:flex-wrap sm:overflow-hidden sm:pb-0">
        {suggestions.map(([label, value]) => (
          <button key={label} type="button" onClick={() => submitSearch(value)} className="focus-ring shrink-0 rounded-full">
            <Badge tone={label.includes("CAD") ? "purple" : "slate"}>{label}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
