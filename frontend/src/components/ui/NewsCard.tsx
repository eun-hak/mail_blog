import { Link } from "react-router-dom";
import { CategoryBadge } from "./CategoryBadge";
import type { Article } from "../../lib/types";

type Props = { article: Article };

export function NewsCard({ article }: Props) {
  return (
    <Link
      to={`/article/${article.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border-primary bg-surface-white transition hover:border-accent-blue/30"
    >
      <div className="h-[200px] overflow-hidden bg-[#D0D0D0]">
        <img
          src={article.imageUrl}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-2.5 p-5">
        <CategoryBadge label={article.category} />
        <h3 className="font-heading text-lg font-semibold leading-snug text-ink-primary line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm leading-relaxed text-ink-secondary line-clamp-2">
          {article.description}
        </p>
        <p className="font-mono text-[11px] font-medium text-ink-tertiary">
          {article.relativeTime}
        </p>
      </div>
    </Link>
  );
}
