import { Suspense } from "react";
import { getArticles } from "@/lib/articles.server";
import { CategoryPageClient } from "@/components/pages/CategoryPageClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const articles = await getArticles();

  return <CategoryPageClient slug={slug} articles={articles} />;
}
