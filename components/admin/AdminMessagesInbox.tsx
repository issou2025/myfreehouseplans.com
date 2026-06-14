"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { AdminMessageTable } from "@/components/admin/AdminMessageTable";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/types/message";

export function AdminMessagesInbox({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadMessages() {
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/messages", { cache: "no-store" });
      const data = (await response.json()) as { success?: boolean; message?: string; data?: { messages?: Message[] } };
      const nextMessages = data.data?.messages;
      if (!response.ok || !data.success || !nextMessages) {
        setNotice(data.message ?? "Unable to load messages.");
        return;
      }
      setMessages(nextMessages);
      setNotice(`Inbox refreshed. ${nextMessages.length} message(s) loaded.`);
    } catch {
      setNotice("Unable to load messages. Check the local dev server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-slate-600">Messages submitted from the public contact form appear here in local MVP mode.</p>
        <Button variant="outline" onClick={loadMessages} className="w-full sm:w-auto"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh inbox</Button>
      </div>
      {notice ? <div className="rounded-2xl bg-sky-50 p-3 text-sm font-semibold text-sky-700">{notice}</div> : null}
      <AdminMessageTable messages={messages} />
    </div>
  );
}
