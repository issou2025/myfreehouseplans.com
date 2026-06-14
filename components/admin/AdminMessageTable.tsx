"use client";

import { useEffect, useMemo, useState } from "react";
import type { Message } from "@/types/message";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function AdminMessageTable({ messages, compact = false }: { messages: Message[]; compact?: boolean }) {
  const [rows, setRows] = useState(messages);
  const [selectedId, setSelectedId] = useState(messages[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const filtered = useMemo(() => rows.filter((message) => {
    const text = `${message.name} ${message.email} ${message.subject} ${message.planConcerned}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "all" || message.status === status) && (type === "all" || message.type === type);
  }), [rows, query, status, type]);
  const selected = rows.find((message) => message.id === selectedId) ?? filtered[0];

  useEffect(() => {
    setRows(messages);
    setSelectedId((current) => messages.some((message) => message.id === current) ? current : messages[0]?.id ?? "");
  }, [messages]);

  async function setMessageStatus(id: string, nextStatus: Message["status"]) {
    const response = await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus })
    });
    if (!response.ok) return false;
    setRows((current) => current.map((message) => message.id === id ? { ...message, status: nextStatus } : message));
    return true;
  }

  async function deleteMessage(id: string) {
    const response = await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (!response.ok) return false;
    setRows((current) => current.filter((message) => message.id !== id));
    return true;
  }

  return (
    <div className={compact ? "" : "grid gap-6 xl:grid-cols-[1fr_360px]"}>
      <Card className="max-w-full overflow-hidden">
        {!compact ? <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-3"><Input placeholder="Search messages..." value={query} onChange={(event) => setQuery(event.target.value)} /><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option>New</option><option>Read</option><option>Replied</option><option>Archived</option></Select><Select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All types</option><option>Custom plan request</option><option>Question before purchase</option><option>Download problem</option><option>Modification request</option><option>Professional service</option></Select></div> : null}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Name", "Email", "Subject", "Plan concerned", "Type", "Status", "Date", "Actions"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{filtered.map((message) => <tr key={message.id} className={selected?.id === message.id ? "bg-sky-50/60" : ""}><td className="px-4 py-3 font-semibold text-slate-950">{message.name}</td><td className="px-4 py-3">{message.email}</td><td className="px-4 py-3">{message.subject}</td><td className="px-4 py-3">{message.planConcerned}</td><td className="px-4 py-3">{message.type}</td><td className="px-4 py-3"><AdminStatusBadge status={message.status} /></td><td className="px-4 py-3">{message.date}</td><td className="px-4 py-3"><div className="grid gap-2"><AdminActionButton message="Message opened and marked as read." onAction={async () => { setSelectedId(message.id); return setMessageStatus(message.id, "Read"); }}>View</AdminActionButton><AdminActionButton message="Email copied to clipboard." onAction={() => navigator.clipboard?.writeText(message.email)}>Copy email</AdminActionButton></div></td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      {!compact && selected ? <Card className="h-fit p-5"><h2 className="text-xl font-black text-slate-950">Message Detail</h2><p className="mt-3 font-semibold text-slate-900">{selected.subject}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{selected.message}</p>{selected.attachmentUrl ? <a href={selected.attachmentUrl} className="safe-break mt-3 block rounded-2xl bg-sky-50 p-3 text-sm font-semibold text-sky-700" target="_blank" rel="noreferrer">Attachment: {selected.attachmentName ?? selected.attachmentUrl}</a> : null}<div className="mt-4 grid gap-2"><AdminActionButton message="Message marked as read." onAction={() => setMessageStatus(selected.id, "Read")}>Mark as read</AdminActionButton><AdminActionButton message="Message marked as replied." onAction={() => setMessageStatus(selected.id, "Replied")}>Mark as replied</AdminActionButton><AdminActionButton message="Message archived." onAction={() => setMessageStatus(selected.id, "Archived")}>Archive</AdminActionButton><AdminActionButton variant="danger" message="Message deleted." onAction={() => deleteMessage(selected.id)}>Delete</AdminActionButton></div></Card> : null}
    </div>
  );
}
