import { MailCheck } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminMessagesInbox } from "@/components/admin/AdminMessagesInbox";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { readMessages } from "@/lib/messageData";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await readMessages();
  return <div><AdminPageHeader title="Messages" subtitle="Triage custom plan requests, purchase questions, download issues and professional service leads." /><Card className="mb-6 p-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><div className="flex items-center gap-2"><MailCheck className="h-5 w-5 text-sky-600" /><h2 className="text-xl font-black text-slate-950">Support Inbox Workflow</h2></div><p className="mt-2 text-sm text-slate-600">Review live contact submissions and keep their status synchronized with durable storage.</p></div><div className="grid gap-2 min-[420px]:grid-cols-2 lg:flex"><AdminActionButton variant="outline" message="Selected messages assigned in MVP mode.">Assign selected</AdminActionButton><AdminActionButton variant="outline" message="Plan request draft created from selected message.">Create plan request</AdminActionButton><AdminActionButton variant="premium" message="Reply drafts generated in MVP mode.">Draft replies</AdminActionButton></div></div></Card><AdminMessagesInbox initialMessages={messages} /></div>;
}
