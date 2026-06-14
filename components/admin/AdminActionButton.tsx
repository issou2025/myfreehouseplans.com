"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type AdminActionButtonProps = {
  children: ReactNode;
  message: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "premium";
  className?: string;
  onAction?: () => void | boolean | Promise<void | boolean>;
};

export function AdminActionButton({ children, message, variant = "outline", className, onAction }: AdminActionButtonProps) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <span className="relative inline-flex min-w-0 flex-col gap-1">
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          try {
            const result = await onAction?.();
            setFeedback(result === false ? "Action failed. Check server configuration and try again." : message);
          } catch {
            setFeedback("Action failed. Check server configuration and try again.");
          } finally {
            setLoading(false);
          }
          window.setTimeout(() => setFeedback(""), 2200);
        }}
      >
        {loading ? "Working..." : children}
      </Button>
      {feedback ? <span className="absolute left-0 top-full z-50 mt-1 w-max max-w-[220px] rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-xl">{feedback}</span> : null}
    </span>
  );
}
