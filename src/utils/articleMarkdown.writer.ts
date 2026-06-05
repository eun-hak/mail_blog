import fs from "node:fs";
import path from "node:path";
import type { GeneratedArticle } from "../types/article.types.js";
import type { ParsedEmail } from "../types/email.types.js";
import type { ExtractedTopic } from "../types/topic.types.js";
import { layoutArticleBody } from "./articleBody.formatter.js";

function escapeYaml(value: string): string {
  return value.replace(/"/g, "'");
}

function countBodyChars(text: string): number {
  return text.replace(/\s/g, "").length;
}

export function slugify(title: string, maxLen = 40): string {
  const slug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, maxLen);
  return slug || "article";
}

export function writeArticleMarkdown(
  filePath: string,
  article: GeneratedArticle,
  meta: {
    email: ParsedEmail;
    topic?: ExtractedTopic;
    originalSubject?: string | null;
    originalFrom?: string | null;
    originalDate?: string | null;
  }
): void {
  const mi = article.marketInfo;
  const bodyText = layoutArticleBody(article.text);
  const bodyChars = countBodyChars(bodyText);
  const highlights = article.highlights ?? [];

  const lines = [
    "---",
    `id: "${article.id}"`,
    `gmailMessageId: "${article.gmailMessageId}"`,
    `source: ${article.source}`,
    `author: ${article.author}`,
    "",
    `originalSubject: "${escapeYaml(meta.originalSubject ?? meta.email.subject ?? "")}"`,
    `originalFrom: "${escapeYaml(meta.originalFrom ?? meta.email.from ?? "")}"`,
    `originalDate: "${escapeYaml(meta.originalDate ?? meta.email.date ?? "")}"`,
    ...(meta.topic
      ? [
          `topicTitle: "${escapeYaml(meta.topic.title)}"`,
          `topicAngle: "${escapeYaml(meta.topic.angle)}"`,
        ]
      : []),
    "",
    `title: "${escapeYaml(article.title)}"`,
    `description: "${escapeYaml(article.description)}"`,
    `category: "${escapeYaml(article.category)}"`,
    `categorySlug: ${article.categorySlug}`,
    `writingStyle: "${escapeYaml(article.writingStyle)}"`,
    `date: "${article.date}"`,
    `readMinutes: ${article.readMinutes}`,
    `imageUrl: "${article.imageUrl}"`,
    "",
    "marketInfo:",
    `  kospi: ${mi.kospi ? `"${mi.kospi}"` : "null"}`,
    `  kosdaq: ${mi.kosdaq ? `"${mi.kosdaq}"` : "null"}`,
    `  usdKrw: ${mi.usdKrw ? `"${mi.usdKrw}"` : "null"}`,
    "",
    "model: gemini-3.1-flash-lite",
    `analyzedAt: "${article.analyzedAt}"`,
    `bodyChars: ${bodyChars}`,
    "status: draft",
    "---",
    "",
    `> ${article.description}`,
    "",
    "## 핵심 요약",
    "",
    ...highlights.map((h) => `- ${h}`),
    "",
    "## 본문",
    "",
    bodyText,
    "",
  ];

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
}
