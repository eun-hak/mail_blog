import { isAllowedNewsletterSender } from "../config/newsletters.js";
import type {
  GeneratedArticle,
  GeminiBlogAnalysis,
} from "../types/article.types.js";
import type { ParsedEmail } from "../types/email.types.js";
import { pickArticleImage } from "./articleImages.js";

function parseSource(from: string | null): "UPPITY" | "DAILY_BYTE" {
  if (!from) return "UPPITY";
  if (from.toUpperCase().includes("DAILY_BYTE")) return "DAILY_BYTE";
  return "UPPITY";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "방금 전";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(dateStr);
}

function estimateReadMinutes(text: string): number {
  const chars = text.replace(/\s/g, "").length;
  return Math.max(3, Math.min(15, Math.round(chars / 500)));
}

export function toGeneratedArticle(
  email: ParsedEmail,
  analysis: GeminiBlogAnalysis,
  options?: { id?: string }
): GeneratedArticle {
  const source = parseSource(email.from);
  const text = analysis.body.trim();
  const id = options?.id ?? email.gmailMessageId;

  return {
    id,
    gmailMessageId: email.gmailMessageId,
    title: analysis.title,
    description: analysis.description,
    category: analysis.category,
    categorySlug: analysis.categorySlug,
    source,
    date: formatDate(email.date),
    relativeTime: formatRelativeTime(email.date),
    readMinutes: estimateReadMinutes(text),
    imageUrl: pickArticleImage(id),
    text,
    marketInfo: analysis.marketInfo,
    author: source === "UPPITY" ? "UPPITY" : "DAILY_BYTE",
    highlights: analysis.highlights ?? [],
    writingStyle: analysis.writingStyle ?? "",
    analyzedAt: new Date().toISOString(),
  };
}

export function assertAllowedSender(email: ParsedEmail): void {
  if (!isAllowedNewsletterSender(email.from)) {
    throw new Error(`허용되지 않은 발신자: ${email.from ?? "(없음)"}`);
  }
}
