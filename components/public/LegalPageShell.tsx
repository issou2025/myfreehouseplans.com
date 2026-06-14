import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { LegalPage } from "@/lib/mockSiteControls";

export function LegalPageShell({ page }: { page: LegalPage }) {
  return (
    <>
      <Header />
      <main className="section-shell py-10 sm:py-14">
        <p className="safe-break text-sm font-semibold text-slate-500">Home / Legal / {page.title}</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Legal notice</p>
            <h1 className="safe-break mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{page.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{page.summary}</p>
            <Card className="mt-8 p-5 sm:p-7">
              <div className="grid gap-5 text-base leading-8 text-slate-700">
                {page.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </Card>
          </section>
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-soft lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-slate-950">Before You Build</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Every plan must be reviewed and adapted by a local architect, engineer or qualified professional before construction.</p>
            <div className="mt-5 grid gap-2">
              <Button href="/plans" className="w-full">Browse Plans</Button>
              <Button href="/contact" variant="outline" className="w-full">Request Custom Help</Button>
            </div>
            <p className="mt-5 text-xs font-semibold text-slate-500">Last updated: {page.updatedAt}</p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
