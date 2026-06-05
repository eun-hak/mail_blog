import { Zap } from "lucide-react";
import { TICKER_FALLBACK } from "../../lib/constants";

type Props = { items?: string[] };

function TickerTrack({ items }: { items: string[] }) {
  return (
    <span className="inline-flex items-center gap-6 px-6">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="inline-flex items-center gap-6">
          {i > 0 && <span className="text-[#555555]">·</span>}
          <span>{item}</span>
        </span>
      ))}
    </span>
  );
}

export function BreakingTicker({ items = [] }: Props) {
  const display = items.length > 0 ? items : TICKER_FALLBACK;

  return (
    <div className="flex h-11 items-center overflow-hidden bg-surface-dark text-[13px] text-[#CCCCCC]">
      <div className="flex shrink-0 items-center gap-1.5 px-8">
        <Zap size={14} className="text-accent-orange" />
        <span className="font-mono text-[11px] font-semibold tracking-wide text-accent-orange">
          실시간 이슈
        </span>
      </div>
      <div className="h-5 w-px shrink-0 bg-[#333355]" />
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="flex w-max animate-ticker motion-reduce:animate-none hover:[animation-play-state:paused]">
          <TickerTrack items={display} />
          <TickerTrack items={display} />
        </div>
      </div>
    </div>
  );
}
