import { BookOpen, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";
import { BlogCard } from "@/components/public/BlogCard";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { ProjectJourney } from "@/components/public/ProjectJourney";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockBlogPosts } from "@/lib/mockBlogPosts";

const categories = ["House Plan Guides", "Construction Cost", "CAD / Revit / BIM", "African House Plans", "Small Houses", "Building Mistakes", "Design Tips"];

export default function BlogPage() {
  const featured = mockBlogPosts[0];
  return <><Header /><main><PublicPageHero eyebrow="Practical building guidance" title="Make clearer decisions before construction gets expensive." description="Understand plan files, plot fit, budgets, phased building and common mistakes through guides connected directly to your next project step." icon={BookOpen} actions={<><Button href="#guides">Explore guides</Button><Button href="/before-you-build" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Read before you build</Button></>} highlights={[{ label: "Plan selection", value: "Choose with real project criteria", icon: FileText }, { label: "Risk reduction", value: "Avoid common planning mistakes", icon: ShieldCheck }, { label: "Project readiness", value: "Know what to prepare next", icon: ClipboardCheck }]} /><ProjectJourney current="prepare" /><section id="guides" className="section-shell scroll-mt-32 py-10 sm:py-12"><div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center"><div className="min-w-0"><p className="section-kicker">Browse by decision</p><h2 className="section-title">Guidance that stays close to the project.</h2><p className="mt-4 max-w-3xl leading-7 text-slate-600">Use these categories to move from curiosity to a better-prepared conversation with your local professional.</p><div className="mt-6 flex flex-wrap gap-2">{categories.map((category) => <Badge key={category} tone="blue">{category}</Badge>)}</div></div><BlogCard post={featured} /></div><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{mockBlogPosts.slice(1).map((post) => <BlogCard key={post.id} post={post} />)}</div></section></main><Footer /></>;
}
