import { AdminBlogTable } from "@/components/admin/AdminBlogTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { mockBlogPosts } from "@/lib/mockBlogPosts";

export default function AdminBlogPage() {
  return <div><AdminPageHeader title="Blog" subtitle="Manage guides, SEO articles, related plan content and publishing status." actions={<Button href="/admin/blog/new">New Article</Button>} /><AdminBlogTable posts={mockBlogPosts} /></div>;
}
