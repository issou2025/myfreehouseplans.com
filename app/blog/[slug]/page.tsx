import { notFound } from "next/navigation";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { NextStepCTA, RelatedArticles, RelatedPlans, RelatedTools } from "@/components/public/RelatedContent";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/public/SafeImage";
import { getBlogPostBySlug } from "@/lib/mockBlogPosts";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();
  return <><Header /><main className="section-shell py-10 sm:py-12"><div className="mx-auto max-w-4xl"><p className="safe-break text-sm font-semibold text-slate-500">Home / Blog / {post.category} / {post.title}</p><Badge tone="blue" className="mt-5">{post.category}</Badge><h1 className="safe-break mt-4 text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl">{post.title}</h1><p className="mt-3 text-sm font-semibold text-slate-500">{post.author} - {post.date} - {post.readTime}</p><div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl shadow-soft"><SafeImage src={post.coverImage} alt={post.title} fill sizes="(max-width: 896px) 100vw, 896px" className="object-cover" /></div><article className="mt-8 grid gap-5 text-base leading-8 text-slate-700 sm:text-lg">{post.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article></div><NextStepCTA /><RelatedPlans /><RelatedTools /><RelatedArticles currentPostId={post.id} /></main><Footer /></>;
}
