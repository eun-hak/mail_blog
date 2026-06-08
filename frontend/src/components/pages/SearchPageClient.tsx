"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { searchArticles } from "@/lib/articles";
import type { Article } from "@/lib/types";
import { NewsCard } from "@/components/ui/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";

type Props = {
  articles: Article[];
};

export function SearchPageClient({ articles }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const [input, setInput] = useState(query);

  const results = useMemo(
    () => searchArticles(articles, query),
    [articles, query]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (input.trim()) params.set("q", input.trim());
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : "/search");
  };

  return (
    <section className="mx-auto max-w-content px-8 py-12">
      <h1 className="font-heading text-4xl font-bold text-ink-primary">검색</h1>
      <p className="mt-3 text-base text-ink-secondary">
        NewsBrief 기사에서 키워드를 검색합니다.
      </p>

      <form onSubmit={handleSearch} className="relative mt-8 max-w-xl">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="키워드를 입력하세요"
          className="h-12 w-full rounded-lg border border-border-primary bg-surface-white pl-11 pr-4 text-sm outline-none focus:border-accent-blue"
        />
      </form>

      {query && results.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {query && (
            <p className="mt-8 text-sm text-ink-secondary">
              &apos;{query}&apos; 검색 결과 {results.length}건
            </p>
          )}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {(query ? results : articles).map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
