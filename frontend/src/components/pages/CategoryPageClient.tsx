"use client";

import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { filterByCategory } from "@/lib/articles";
import type { Article, CategorySlug } from "@/lib/types";
import { FeaturedNewsCard } from "@/components/ui/FeaturedNewsCard";
import { NewsCard } from "@/components/ui/NewsCard";
import { FilterButton } from "@/components/ui/FilterButton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const PER_PAGE = 6;

type Props = {
  slug: string;
  articles: Article[];
};

export function CategoryPageClient({ slug, articles }: Props) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  const category =
    CATEGORIES.find((c) => c.slug === slug) ?? {
      slug: "economy" as CategorySlug,
      label: "경제",
      description: "국내외 경제 이슈와 시장 동향을 분석합니다.",
    };

  const filtered = useMemo(
    () => filterByCategory(articles, category.slug),
    [articles, category.slug]
  );

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === "popular") list.reverse();
    return list;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <section className="mx-auto max-w-content px-8 py-12 text-center">
        <h1 className="font-heading text-4xl font-bold text-ink-primary">
          {category.label}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-ink-secondary">
          {category.description}
        </p>
        <p className="mt-3 font-mono text-[11px] text-ink-tertiary">
          최신 업데이트: {formatDate(new Date())}{" "}
          {new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </section>

      <section className="mx-auto max-w-content space-y-8 px-8 pb-12">
        {sorted[0] && <FeaturedNewsCard article={sorted[0]} />}

        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-secondary">
            총 {filtered.length}개의 글
          </p>
          <div className="flex gap-2">
            <FilterButton
              label="최신순"
              active={sort === "latest"}
              onClick={() => setSort("latest")}
            />
            <FilterButton
              label="인기순"
              active={sort === "popular"}
              onClick={() => setSort("popular")}
            />
          </div>
        </div>

        {paged.length === 0 ? (
          <EmptyState
            title="이 카테고리에 글이 없습니다"
            description="다른 카테고리를 확인해 보세요."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {paged.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        )}

        {filtered.length > PER_PAGE && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </section>
    </>
  );
}
