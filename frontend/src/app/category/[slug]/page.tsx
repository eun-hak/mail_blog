import { getArticles } from "@/lib/articles.server";
import { CategoryPageClient } from "@/components/pages/CategoryPageClient";
import { EmptyState } from "@/components/ui/EmptyState";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  try {
    const articles = await getArticles();
    return <CategoryPageClient slug={slug} articles={articles} />;
  } catch {
    return (
      <EmptyState
        title="카테고리 글을 불러오지 못했습니다"
        description="백엔드 API(localhost:3002)가 실행 중인지 확인한 뒤 새로고침해 주세요."
      />
    );
  }
}
