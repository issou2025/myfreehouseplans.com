"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Copy, Eye, Pencil, Send, Trash2 } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminScoreBadge } from "@/components/admin/AdminScoreBadge";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function AdminBlogTable({ posts }: { posts: BlogPost[] }) {
  const [rows, setRows] = useState(posts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const categories = Array.from(new Set(rows.map((post) => post.category)));
  const filtered = useMemo(() => rows.filter((post) => {
    const text = `${post.title} ${post.category}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "all" || post.status.toLowerCase() === status) && (category === "all" || post.category === category);
  }), [rows, query, status, category]);

  function setPostStatus(id: string, nextStatus: BlogPost["status"]) {
    setRows((current) => current.map((post) => post.id === id ? { ...post, status: nextStatus } : post));
  }

  function duplicatePost(id: string) {
    setRows((current) => {
      const source = current.find((post) => post.id === id);
      if (!source) return current;
      return [{ ...source, id: `${source.id}-copy-${Date.now()}`, title: `${source.title} Copy`, slug: `${source.slug}-copy`, status: "Draft" }, ...current];
    });
  }

  return (
    <Card className="max-w-full overflow-hidden">
      <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-3">
        <Input placeholder="Search articles..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></Select>
        <Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</Select>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Cover", "Title", "Category", "Status", "SEO Score", "Date", "Actions"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{filtered.map((post) => <tr key={post.id} className="transition hover:bg-sky-50/40"><td className="px-4 py-3">{post.coverImage ? <Image src={post.coverImage} alt="" width={64} height={48} sizes="64px" className="h-12 w-16 rounded-xl object-cover" /> : <div className="grid h-12 w-16 place-items-center rounded-xl bg-slate-100 text-[10px] font-bold uppercase text-slate-400">No cover</div>}</td><td className="px-4 py-3 font-semibold text-slate-950">{post.title}</td><td className="px-4 py-3">{post.category}</td><td className="px-4 py-3"><AdminStatusBadge status={post.status} /></td><td className="px-4 py-3"><AdminScoreBadge score={post.seoScore ?? 60} /></td><td className="px-4 py-3">{post.date}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><AdminActionButton message="Blog edit opens as mock form in this MVP."><Pencil className="h-4 w-4" /> Edit</AdminActionButton><Button href={`/blog/${post.slug}`} variant="outline"><Eye className="h-4 w-4" /> Preview</Button><AdminActionButton message={post.status === "Published" ? "Article moved to draft." : "Article published."} onAction={() => setPostStatus(post.id, post.status === "Published" ? "Draft" : "Published")}><Send className="h-4 w-4" /> {post.status === "Published" ? "Unpublish" : "Publish"}</AdminActionButton><AdminActionButton message="Article duplicated as draft." onAction={() => duplicatePost(post.id)}><Copy className="h-4 w-4" /> Duplicate</AdminActionButton><AdminActionButton variant="danger" message="Article removed from this session." onAction={() => setRows((current) => current.filter((item) => item.id !== post.id))}><Trash2 className="h-4 w-4" /> Delete</AdminActionButton></div></td></tr>)}
            {!filtered.length ? <tr><td colSpan={7} className="px-4 py-10 text-center"><p className="text-lg font-black text-slate-950">No blog articles found</p><p className="mt-1 text-sm text-slate-500">Create a guide or adjust the search and filters.</p><div className="mt-4"><Button href="/admin/blog/new">Create Blog Post</Button></div></td></tr> : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
