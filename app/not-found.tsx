import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="blueprint-panel grid min-h-screen place-items-center px-4 py-12 text-white">
      <section className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 text-center shadow-2xl backdrop-blur-xl sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">404 / Plan not found</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">This page is not on the drawing board.</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">The link may have changed, but the plan catalog and project tools are ready to help you continue.</p>
        <div className="mt-7 flex flex-col justify-center gap-2 min-[420px]:flex-row">
          <Button href="/plans"><Search className="h-4 w-4" /> Browse Plans</Button>
          <Button href="/" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Homepage</Button>
        </div>
      </section>
    </main>
  );
}
