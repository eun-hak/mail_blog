import { Link, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useEmailContext } from "../context/EmailContext";
import { CategoryBadge } from "../components/ui/CategoryBadge";
import { ShareButtons } from "../components/ui/ShareButtons";
import { NewsCard } from "../components/ui/NewsCard";
import { ArticleBody } from "../components/ui/ArticleBody";
import { EmptyState } from "../components/ui/EmptyState";

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { getById, articles, loading } = useEmailContext();
  const article = id ? getById(id) : undefined;

  if (loading) {
    return <div className="py-24 text-center text-ink-secondary">불러오는 중...</div>;
  }

  if (!article) {
    return (
      <EmptyState
        title="글을 찾을 수 없습니다"
        description="목록에서 다시 선택해 주세요."
      />
    );
  }

  const related = articles
    .filter((a) => a.id !== article.id && a.categorySlug === article.categorySlug)
    .slice(0, 3);

  const hasMarket =
    article.marketInfo.kospi ||
    article.marketInfo.kosdaq ||
    article.marketInfo.usdKrw;

  const highlights =
    article.highlights && article.highlights.length > 0
      ? article.highlights
      : null;

  return (
    <article className="mx-auto max-w-[680px] px-4 py-6 sm:px-6">
      <header className="space-y-3">
        <CategoryBadge label={article.category} />
        <h1 className="font-heading text-[28px] font-bold leading-snug text-black sm:text-[32px]">
          {article.title}
        </h1>
        <p className="text-[15px] leading-relaxed text-black/80">
          {article.description}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-black/60">
          <span className="font-medium text-black">{article.author}</span>
          <span>·</span>
          <span className="font-mono">{article.date}</span>
          <span>·</span>
          <span className="font-mono">읽는 시간 {article.readMinutes}분</span>
        </div>
      </header>

      <div className="mt-5 overflow-hidden rounded-lg">
        <img
          src={article.imageUrl}
          alt=""
          className="h-[240px] w-full object-cover sm:h-[280px]"
        />
      </div>

      {(highlights || hasMarket) && (
        <div className="mt-5 rounded-lg border-l-[3px] border-accent-blue bg-accent-blue-light px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-blue" />
            <h2 className="font-heading text-base font-semibold text-black">
              핵심 요약
            </h2>
          </div>
          <ul className="mt-2 space-y-1.5 text-[13px] text-black/80">
            {highlights?.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {article.marketInfo.kospi && (
              <li>코스피 {article.marketInfo.kospi}</li>
            )}
            {article.marketInfo.kosdaq && (
              <li>코스닥 {article.marketInfo.kosdaq}</li>
            )}
            {article.marketInfo.usdKrw && (
              <li>원-달러 환율 {article.marketInfo.usdKrw}</li>
            )}
          </ul>
        </div>
      )}

      <ArticleBody text={article.text} />

      <div className="mt-8 border-t border-border-primary pt-6">
        <ShareButtons />
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-bold text-black">
            관련 글
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {related.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Link to="/" className="text-sm font-medium text-accent-blue">
          ← 목록으로
        </Link>
      </div>
    </article>
  );
}
