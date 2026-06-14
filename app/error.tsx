"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="blueprint-panel grid min-h-screen place-items-center px-4 py-12 text-white">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 text-center shadow-2xl backdrop-blur-xl sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Temporary issue</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">Let&apos;s reload the project.</h1>
        <p className="mt-4 leading-7 text-slate-300">Something did not load correctly. Your project data is safe, and you can try the page again.</p>
        <Button type="button" className="mt-7" onClick={reset}><RefreshCw className="h-4 w-4" /> Try Again</Button>
      </section>
    </main>
  );
}
