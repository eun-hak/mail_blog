import type { CategorySlug, ParsedEmail, Article } from "./types";
import { PLACEHOLDER_IMAGES } from "./constants";

export function parseSender(from: string | null): "UPPITY" | "DAILY_BYTE" {
  if (!from) return "UPPITY";
  if (from.toUpperCase().includes("DAILY_BYTE")) return "DAILY_BYTE";
  return "UPPITY";
}

export function mapSourceToCategory(source: "UPPITY" | "DAILY_BYTE"): {
  category: string;
  categorySlug: CategorySlug;
} {
  if (source === "DAILY_BYTE") {
    return { category: "테크", categorySlug: "tech" };
  }
  return { category: "경제", categorySlug: "economy" };
}

export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "방금 전";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(date);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function estimateReadMinutes(text: string | null): number {
  if (!text) return 3;
  const chars = text.replace(/\s/g, "").length;
  return Math.max(3, Math.min(15, Math.round(chars / 500)));
}

export function pickImage(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % PLACEHOLDER_IMAGES.length;
  }
  return PLACEHOLDER_IMAGES[hash];
}

export function emailToArticle(email: ParsedEmail): Article {
  const source = parseSender(email.from);
  const { category, categorySlug } = mapSourceToCategory(source);
  const text = email.text ?? "";
  const title = email.subject ?? email.parsed.title ?? "제목 없음";
  const description =
    email.parsed.summaryCandidate?.slice(0, 160) ??
    text.slice(0, 160) ??
    "";

  return {
    id: email.gmailMessageId,
    title,
    description,
    category,
    categorySlug,
    source,
    date: formatDate(email.date),
    relativeTime: formatRelativeTime(email.date),
    readMinutes: estimateReadMinutes(text),
    imageUrl: pickImage(email.gmailMessageId),
    text,
    marketInfo: email.parsed.marketInfo,
    author: source === "UPPITY" ? "UPPITY" : "DAILY_BYTE",
  };
}

export function buildTickerItems(articles: Article[]): string[] {
  const items = articles
    .slice(0, 3)
    .map((a) => a.title.replace(/^[^\w가-힣]+/, "").slice(0, 40));
  return items.length > 0 ? items : [];
}
