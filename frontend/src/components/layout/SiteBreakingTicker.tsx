import { useEmailContext } from "../../context/EmailContext";
import { buildTickerItems } from "../../lib/utils";
import { BreakingTicker } from "../ui/BreakingTicker";

export function SiteBreakingTicker() {
  const { articles, loading } = useEmailContext();

  if (loading || articles.length === 0) return null;

  return <BreakingTicker items={buildTickerItems(articles)} />;
}
