import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useEmailContext } from "../context/EmailContext";
import { FeaturedNewsCard } from "../components/ui/FeaturedNewsCard";
import { NewsCard } from "../components/ui/NewsCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { AdPlaceholder } from "../components/ui/AdPlaceholder";
import { NewsletterBox } from "../components/ui/NewsletterBox";
import { EmptyState } from "../components/ui/EmptyState";

export function HomePage() {
  const { articles, loading, error } = useEmailContext();

  if (loading) {
    return (
      <div className="py-24 text-center text-ink-secondary">불러오는 중...</div>
    );
  }

  if (error || articles.length === 0) {
    return (
      <EmptyState
        title="뉴스를 불러오지 못했습니다"
        description={error ?? "데이터를 확인해 주세요."}
      />
    );
  }

  const featured = articles[0];
  const topStories = articles.slice(1, 4);
  const latest = articles.slice(4, 7);
  const uppityArticles = articles.filter((a) => a.source === "UPPITY");
  const dailyArticles = articles.filter((a) => a.source === "DAILY_BYTE");

  return (
    <>
      <section className="mx-auto max-w-content px-8 py-10">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent-red" />
          <span className="font-mono text-xs font-semibold tracking-wide text-accent-red">
            오늘의 주요 뉴스
          </span>
        </div>
        <FeaturedNewsCard article={featured} />
      </section>

      {topStories.length > 0 && (
        <section className="mx-auto max-w-content space-y-6 px-8 py-10">
          <SectionHeader title="오늘의 핵심 뉴스" moreTo="/category/economy" />
          <div className="grid gap-6 md:grid-cols-3">
            {topStories.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-content space-y-10 px-8 py-10">
        <SectionHeader title="카테고리별 뉴스" />
        {uppityArticles.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <CategorySectionLabel label="UPPITY · 경제" />
              <FeaturedNewsCard article={uppityArticles[0]} />
            </div>
            <div className="grid gap-4">
              {uppityArticles.slice(1, 4).map((a) => (
                <CompactRow key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}
        {dailyArticles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-3">
              <CategorySectionLabel label="DAILY_BYTE · 테크" />
            </div>
            {dailyArticles.slice(0, 3).map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      {latest.length > 0 && (
        <section className="mx-auto max-w-content space-y-6 px-8 py-10">
          <SectionHeader title="최신 글" moreTo="/search" moreLabel="전체 보기" />
          <div className="grid gap-6 md:grid-cols-3">
            {latest.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <section className="px-8 py-6">
        <AdPlaceholder />
      </section>

      <section className="px-8 py-10">
        <NewsletterBox />
      </section>
    </>
  );
}

function CategorySectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Sparkles size={16} className="text-accent-blue" />
      <span className="font-mono text-xs font-semibold tracking-wide text-accent-blue">
        {label}
      </span>
    </div>
  );
}

function CompactRow({ article }: { article: import("../lib/types").Article }) {
  return (
    <Link
      to={`/article/${article.id}`}
      className="block rounded-lg border border-border-primary bg-surface-white p-4 hover:border-accent-blue/30"
    >
      <p className="font-heading text-base font-semibold leading-snug text-ink-primary line-clamp-2">
        {article.title}
      </p>
      <p className="mt-1 font-mono text-[11px] text-ink-tertiary">
        {article.relativeTime}
      </p>
    </Link>
  );
}
