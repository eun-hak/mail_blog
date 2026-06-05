import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  moreTo?: string;
  moreLabel?: string;
};

export function SectionHeader({
  title,
  moreTo,
  moreLabel = "더 보기",
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-heading text-2xl font-bold text-ink-primary">
        {title}
      </h2>
      {moreTo && (
        <Link
          to={moreTo}
          className="flex items-center gap-1 text-[13px] font-medium text-accent-blue"
        >
          {moreLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
