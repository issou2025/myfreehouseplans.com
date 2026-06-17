import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getAdminConfigIssue, getAdminConfigMessage } from "@/lib/adminConfig";

type AdminLoginPageProps = {
  searchParams?: Promise<{ error?: string; next?: string }>;
};

export const metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const nextPath = params?.next?.startsWith("/") ? params.next : "/admin";
  const hasError = params?.error === "1";
  const configIssue = getAdminConfigIssue();
  const configMessage = getAdminConfigMessage(configIssue);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/10">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-sky-600">Admin CMS</p>
              <h1 className="text-2xl font-black text-slate-950">Connexion</h1>
            </div>
          </div>

          <form action="/api/admin/login" method="post" className="mt-6 grid gap-4">
            <input type="hidden" name="next" value={nextPath} />
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Username
              <Input name="username" autoComplete="username" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Mot de passe
              <Input name="password" type="password" autoComplete="current-password" required />
            </label>

            {hasError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                Username ou mot de passe incorrect.
              </p>
            ) : null}
            {configMessage ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                Configuration admin incomplete: {configMessage}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={Boolean(configIssue)}>
              <LockKeyhole className="h-4 w-4" />
              Se connecter
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
