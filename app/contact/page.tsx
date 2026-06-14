"use client";

import { useEffect, useState } from "react";
import { BedDouble, CheckCircle2, FileText, Files, Loader2, Mail, MapPin, MessageSquare, Palette, Phone, Ruler, ShieldCheck, Upload, User, WalletCards, X } from "lucide-react";
import type { ReactNode } from "react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { ProjectJourney } from "@/components/public/ProjectJourney";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type UploadResponse = {
  success: boolean;
  message: string;
  data?: { name: string; url: string; size: number };
  errors?: Record<string, string>;
};

type MessageResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

type ContactForm = {
  name: string;
  email: string;
  country: string;
  plotSize: string;
  bedrooms: string;
  preferredStyle: string;
  budgetLevel: string;
  fileNeeds: string;
  message: string;
  website: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  country: "",
  plotSize: "",
  bedrooms: "3 bedrooms",
  preferredStyle: "",
  budgetLevel: "Low cost",
  fileNeeds: "PDF",
  message: "",
  website: ""
};

function FieldShell({ label, error, icon, children }: { label: string; error?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      <span className="flex items-center gap-2">{icon}{label}</span>
      <div className="relative mt-2">{children}</div>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; size: number } | null>(null);

  const [planContext, setPlanContext] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    const title = params.get("title");
    const pack = params.get("pack");
    setPlanContext(plan ? `${title ?? "Plan"} (${plan})${pack ? ` - ${pack}` : ""}` : "");
    if (pack) setForm((current) => ({ ...current, fileNeeds: pack.includes("CAD") ? "All files" : "PDF" }));
  }, []);

  function setField<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
    if (form.message.trim().length < 10) nextErrors.message = "Please describe the request in at least 10 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function uploadSketch(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/contact-upload", { method: "POST", body });
      const data = (await response.json()) as UploadResponse;
      if (!response.ok || !data.success || !data.data) {
        setUploadError(data.errors?.file ?? data.message ?? "Upload failed. Please try another file.");
        return;
      }
      setUploadedFile(data.data);
    } catch {
      setUploadError("Upload failed. Please check the file and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function submitRequest() {
    if (!validateForm()) {
      setFeedback({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subject: "Custom plan request",
          planConcerned: planContext || "Custom request",
          attachmentUrl: uploadedFile?.url,
          attachmentName: uploadedFile?.name
        })
      });
      const data = (await response.json()) as MessageResponse;
      if (!response.ok || !data.success) {
        setErrors(data.errors ?? {});
        setFeedback({ type: "error", message: data.message || "Unable to send request." });
        return;
      }
      setFeedback({ type: "success", message: "Request received. Our project team can now review your brief." });
      setForm(initialForm);
      setUploadedFile(null);
    } catch {
      setFeedback({ type: "error", message: "Unable to send request right now." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main>
      <PublicPageHero eyebrow="Project support desk" title="Turn your questions and change ideas into a structured request." description="Share the plan, plot, rooms, budget and files you need. A clear brief makes the next professional conversation faster and more useful." icon={MessageSquare} actions={<Button href="#request-form">Start my request</Button>} highlights={[{ label: "Plan modifications", value: "Rooms, doors, terraces and layout notes", icon: Palette }, { label: "Project context", value: "Plot, country, budget and bedrooms", icon: MapPin }, { label: "File support", value: "PDF, DWG, Revit, IFC and sketches", icon: Files }]} />
      <ProjectJourney current="prepare" />
      <section id="request-form" className="section-shell grid scroll-mt-32 gap-8 py-10 sm:py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="min-w-0">
          <Badge tone="blue">Request checklist</Badge>
          <h2 className="safe-break mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Give the team enough context to help properly.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">Tell us about your land, family, style, budget and file needs. You can also upload a sketch, image or PDF up to 8MB.</p>
          {planContext ? <p className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-bold text-sky-800">Modification request for {planContext}</p> : null}
          <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-700">
            <a href="tel:+22796380877" className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"><Phone className="h-5 w-5 text-sky-600" /> +227 96 38 08 77</a>
            <a href="mailto:entreprise2rc@gmail.com" className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"><Mail className="h-5 w-5 text-sky-600" /> entreprise2rc@gmail.com</a>
            <p className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"><Files className="h-5 w-5 text-sky-600" /> PDF, DWG, Revit and custom plan guidance</p>
            <p className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"><ShieldCheck className="h-5 w-5 text-sky-600" /> Local professional review always recommended</p>
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p><strong>Your request is protected.</strong> We validate submissions, limit automated abuse, and only use your details to respond to your project.</p>
          </div>
          {feedback ? <div className={`mb-4 rounded-2xl p-4 text-sm font-semibold ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{feedback.message}</div> : null}
          <label className="sr-only" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setField("website", event.target.value)} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldShell label="Name" error={errors.name} icon={<User className="h-4 w-4 text-sky-600" />}><User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" value={form.name} onChange={(event) => setField("name", event.target.value)} /></FieldShell>
            <FieldShell label="Email" error={errors.email} icon={<Mail className="h-4 w-4 text-sky-600" />}><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} /></FieldShell>
            <FieldShell label="Country" icon={<MapPin className="h-4 w-4 text-sky-600" />}><MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" value={form.country} onChange={(event) => setField("country", event.target.value)} /></FieldShell>
            <FieldShell label="Plot size" icon={<Ruler className="h-4 w-4 text-sky-600" />}><Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="20 m x 20 m / 66 ft x 66 ft" value={form.plotSize} onChange={(event) => setField("plotSize", event.target.value)} /></FieldShell>
            <FieldShell label="Number of bedrooms" icon={<BedDouble className="h-4 w-4 text-sky-600" />}><BedDouble className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Select className="pl-9" value={form.bedrooms} onChange={(event) => setField("bedrooms", event.target.value)}><option>3 bedrooms</option><option>4 bedrooms</option><option>5+ bedrooms</option></Select></FieldShell>
            <FieldShell label="Preferred style" icon={<Palette className="h-4 w-4 text-sky-600" />}><Palette className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Modern, African, low cost..." value={form.preferredStyle} onChange={(event) => setField("preferredStyle", event.target.value)} /></FieldShell>
            <FieldShell label="Budget level" icon={<WalletCards className="h-4 w-4 text-sky-600" />}><WalletCards className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Select className="pl-9" value={form.budgetLevel} onChange={(event) => setField("budgetLevel", event.target.value)}><option>Low cost</option><option>Moderate</option><option>Premium</option></Select></FieldShell>
            <FieldShell label="Need PDF / DWG / Revit?" icon={<Files className="h-4 w-4 text-sky-600" />}><Files className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Select className="pl-9" value={form.fileNeeds} onChange={(event) => setField("fileNeeds", event.target.value)}><option>PDF</option><option>DWG</option><option>Revit</option><option>All files</option></Select></FieldShell>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
            <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-sky-600" /> Message</span>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Textarea className="pl-9" placeholder="Describe your project..." value={form.message} onChange={(event) => setField("message", event.target.value)} />
            </div>
            {errors.message ? <span className="text-xs text-red-600">{errors.message}</span> : null}
          </label>

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-600">
            <div className="flex flex-col gap-3 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Upload className="h-5 w-5 shrink-0 text-sky-600" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-950">Upload sketch or project file</p>
                  <p className="safe-break text-xs text-slate-500">JPG, PNG, WebP or PDF, maximum 8MB.</p>
                </div>
              </div>
              <label className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Choose file"}
                <input className="sr-only" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => uploadSketch(event.target.files?.[0])} />
              </label>
            </div>
            {uploadError ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{uploadError}</p> : null}
            {uploadedFile ? (
              <div className="mt-4 grid gap-3 rounded-2xl bg-white p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <FileText className="h-6 w-6 text-sky-600" />
                <div className="min-w-0">
                  <p className="safe-break text-sm font-bold text-slate-950">{uploadedFile.name}</p>
                  <p className="safe-break text-xs text-slate-500">{uploadedFile.url} - {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setUploadedFile(null)}><X className="h-4 w-4" /> Remove</Button>
              </div>
            ) : null}
          </div>

          <Button className="mt-5 w-full sm:w-auto" onClick={submitRequest} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{submitting ? "Sending..." : "Request a Custom Plan"}</Button>
        </Card>
      </section>
      </main>
      <Footer />
    </>
  );
}
