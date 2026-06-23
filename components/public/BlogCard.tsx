import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SafeImage } from "@/components/public/SafeImage";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group h-full overflow-hidden hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100"><SafeImage src={post.coverImage} alt={post.title} fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" /></div>
        <div className="p-4 sm:p-5">
          <Badge tone="blue">{post.category}</Badge>
          <h3 className="mt-3 text-lg font-black text-slate-950">{post.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
          <p className="mt-3 text-xs font-semibold text-slate-500 sm:mt-4">{post.date} - {post.readTime}</p>
        </div>
      </Card>
    </Link>
  );
}
