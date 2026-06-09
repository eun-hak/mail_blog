import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogCategorySlug, GeneratedArticle } from "../types/article.types.js";
import { pickArticleImage } from "./articleImages.js";

type Frontmatter = {
  id?: string;
  gmailMessageId?: string;
  source?: "UPPITY" | "DAILY_BYTE";
  author?: string;
  title?: string;
  description?: string;
  category?: string;
  categorySlug?: BlogCategorySlug;
  writingStyle?: string;
  date?: string;
  readMinutes?: number;
  imageUrl?: string;
  marketInfo?: {
    kospi?: string | null;
    kosdaq?: string | null;
    usdKrw?: string | null;
  };
  analyzedAt?: string;
};

function parseHighlights(content: string): string[] {
  const section = content.match(/## 핵심 요약\s*\n+([\s\S]*?)(?=\n## |\n*$)/);
  if (!section) return [];

  return [...section[1].matchAll(/^- (.+)$/gm)].map((m) => m[1].trim());
}

function parseBody(content: string): string {
  const section = content.match(/## 본문\s*\n+([\s\S]*)$/);
  return section ? section[1].trim() : "";
}

function formatRelativeTime(dateStr: string): string {
  const parts = dateStr.split(".");
  if (parts.length !== 3) return "최근";

  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
  if (Number.isNaN(date.getTime())) return "최근";

  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return dateStr;
}

export function parseMarkdownArticleFile(filePath: string): GeneratedArticle {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;

  const id = fm.id ?? fm.gmailMessageId ?? path.basename(filePath, ".md");
  const source = fm.source ?? "UPPITY";
  const text = parseBody(content);
  const highlights = parseHighlights(content);

  return {
    id,
    gmailMessageId: fm.gmailMessageId ?? id,
    title: fm.title ?? "제목 없음",
    description: fm.description ?? "",
    category: fm.category ?? "경제",
    categorySlug: fm.categorySlug ?? "economy",
    source,
    date: fm.date ?? "",
    relativeTime: formatRelativeTime(fm.date ?? ""),
    readMinutes: fm.readMinutes ?? 5,
    imageUrl: fm.imageUrl ?? pickArticleImage(id),
    text,
    marketInfo: {
      kospi: fm.marketInfo?.kospi ?? null,
      kosdaq: fm.marketInfo?.kosdaq ?? null,
      usdKrw: fm.marketInfo?.usdKrw ?? null,
    },
    author: fm.author ?? source,
    highlights,
    writingStyle: fm.writingStyle ?? "",
    analyzedAt: fm.analyzedAt ?? new Date().toISOString(),
  };
}

export function getExampleArticlesDir(): string {
  return path.join(process.cwd(), "example", "articles");
}

export function getGeneratedArticlesDir(): string {
  return path.join(process.cwd(), "generated", "articles");
}

function listMarkdownInDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .sort()
    .map((name) => path.join(dir, name));
}

export function listExampleMarkdownFiles(): string[] {
  const generated = listMarkdownInDir(getGeneratedArticlesDir());
  if (generated.length > 0) return generated;
  return listMarkdownInDir(getExampleArticlesDir());
}

function parseArticleDateMs(dateStr: string): number {
  const parts = dateStr.split(".");
  if (parts.length !== 3) return 0;
  const t = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  ).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** 날짜(내림차순) → analyzedAt 순 */
export function sortArticlesByRecency(
  articles: GeneratedArticle[]
): GeneratedArticle[] {
  return [...articles].sort((a, b) => {
    const byDate = parseArticleDateMs(b.date) - parseArticleDateMs(a.date);
    if (byDate !== 0) return byDate;
    return b.analyzedAt.localeCompare(a.analyzedAt);
  });
}
