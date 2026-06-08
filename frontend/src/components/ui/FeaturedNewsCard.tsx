import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import type { Article } from "@/lib/types";

type Props = { article: Article };

export function FeaturedNewsCard({ article }: Props) {
  return (
    <div className="grid min-h-[400px] overflow-hidden rounded-xl border border-border-primary bg-surface-white md:grid-cols-2">
      <div className="relative min-h-[240px] bg-[#C0C8D0] md:min-h-full">
        <img
          src={article.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-4 p-8 md:p-10">
        <CategoryBadge label={article.category} />
        <h2 className="font-heading text-[28px] font-bold leading-tight text-ink-primary md:text-[32px]">
          {article.title}
        </h2>
        <p className="text-[15px] leading-relaxed text-ink-secondary line-clamp-3">
          {article.description}
        </p>
        <div className="flex items-center gap-4 font-mono text-xs text-ink-tertiary">
          <span>{article.relativeTime}</span>
          <span>읽는 시간 {article.readMinutes}분</span>
        </div>
        <Link
          href={`/article/${article.id}`}
          className="inline-flex w-fit items-center gap-1.5 rounded-md bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue-dark"
        >
          자세히 보기
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
