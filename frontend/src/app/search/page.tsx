import { Suspense } from "react";
import { getArticles } from "@/lib/articles.server";
import { SearchPageClient } from "@/components/pages/SearchPageClient";

export default async function SearchPage() {
  const articles = await getArticles();

  return (
    <Suspense fallback={<p className="py-24 text-center">불러오는 중...</p>}>
      <SearchPageClient articles={articles} />
    </Suspense>
  );
}
