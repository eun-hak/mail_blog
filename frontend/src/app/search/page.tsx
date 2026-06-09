import { Suspense } from "react";
import { getArticles } from "@/lib/articles.server";
import { SearchPageClient } from "@/components/pages/SearchPageClient";

export default async function SearchPage() {
  let articles: Awaited<ReturnType<typeof getArticles>> = [];

  try {
    articles = await getArticles();
  } catch {
    return (
      <div className="mx-auto max-w-content px-8 py-24 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink-primary">
          검색할 글을 불러오지 못했습니다
        </h1>
        <p className="mt-2 text-ink-secondary">
          백엔드 API가 실행 중인지 확인한 뒤 새로고침해 주세요.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<p className="py-24 text-center">불러오는 중...</p>}>
      <SearchPageClient articles={articles} />
    </Suspense>
  );
}
