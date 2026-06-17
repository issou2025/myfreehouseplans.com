import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Home } from "lucide-react";
import type { Category } from "@/types/category";
import { Card } from "@/components/ui/Card";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/plans?category=${category.slug}`} className="block h-full">
      <Card className="group relative h-full min-h-64 overflow-hidden border-0 bg-slate-950 p-0 transition hover:shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
        {category.imageUrl ? <Image src={category.imageUrl} alt="" fill sizes="(max-width: 519px) 100vw, (max-width: 1023px) 50vw, 25vw" className="object-cover opacity-65 transition duration-700 group-hover:scale-105 group-hover:opacity-75" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/5" />
        <div className="relative flex h-full min-h-64 flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md border border-white/20 bg-white/15 text-white backdrop-blur"><Home className="h-5 w-5" /></span>
            <span className="rounded-md border border-white/20 bg-white/15 p-2 text-white backdrop-blur transition group-hover:translate-x-0.5"><ArrowUpRight className="h-4 w-4" /></span>
          </div>
          <div>
            <p className="text-lg font-extrabold text-white sm:text-xl">{category.name}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-200">{category.description}</p>
            <p className="mt-4 text-sm font-bold text-sky-300">{category.planCount} plans available</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
