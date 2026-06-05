import { Newspaper } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = "검색 결과가 없습니다",
  description = "다른 키워드로 다시 검색해 보세요.",
}: Props) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <Newspaper size={48} className="text-ink-muted" strokeWidth={1.5} />
      <h3 className="mt-4 font-heading text-xl font-semibold text-ink-primary">
        {title}
      </h3>
      <p className="mt-2 text-sm text-ink-secondary">{description}</p>
    </div>
  );
}
