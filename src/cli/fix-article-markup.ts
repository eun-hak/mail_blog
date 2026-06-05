import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { layoutArticleBody } from "../utils/articleBody.formatter.js";
import { getGeneratedArticlesDir } from "../services/batchGeneration.service.js";

function parseHighlights(content: string): string[] {
  const section = content.match(/## 핵심 요약\s*\n+([\s\S]*?)(?=\n## |\n*$)/);
  if (!section) return [];
  return [...section[1].matchAll(/^- (.+)$/gm)].map((m) => m[1].trim());
}

function extractRawBody(content: string): string {
  const section = content.match(/## 본문\s*\n+([\s\S]*)$/);
  return section ? section[1].trim() : content.trim();
}

/** 핵심 요약: 소제목 기반으로 복원 */
function deriveHighlights(body: string, description: string): string[] {
  const sections = [...body.matchAll(/^### (.+)$/gm)].map((m) => m[1].trim());
  if (sections.length >= 2) return sections.slice(0, 4);

  const intro = body
    .replace(/^### [^\n]+\n+/m, "")
    .split(/\n\n### /)[0]
    ?.trim() ?? "";
  const introSentence = intro.match(/[^.?!…]+[.?!…]/)?.[0]?.trim();

  const bullets = [introSentence, ...sections].filter(
    (b): b is string => Boolean(b && b.length > 10 && !b.startsWith("###"))
  );

  if (bullets.length >= 2) return bullets.slice(0, 4);
  return description
    .split(/[.?!…]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
    .slice(0, 4);
}

function rebuildContent(
  description: string,
  highlights: string[],
  body: string
): string {
  const lines = [
    `> ${description}`,
    "",
    "## 핵심 요약",
    "",
    ...highlights.map((h) => `- ${h}`),
    "",
    "## 본문",
    "",
    body,
    "",
  ];
  return lines.join("\n");
}

function fixArticleFile(filePath: string): boolean {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const description =
    typeof data.description === "string" ? data.description : "";
  const rawBody = extractRawBody(content);
  const fixedBody = layoutArticleBody(rawBody);
  const highlights = deriveHighlights(fixedBody, description);

  const newContent = rebuildContent(description, highlights, fixedBody);
  if (newContent.trim() === content.trim()) {
    console.log(`  ✓ 변경 없음: ${path.basename(filePath)}`);
    return false;
  }

  const bodyChars = fixedBody.replace(/\s/g, "").length;

  const frontmatter = { ...data, bodyChars };
  const output = matter.stringify(newContent, frontmatter);
  fs.writeFileSync(filePath, output, "utf-8");
  console.log(`  ✓ 수정: ${path.basename(filePath)}`);
  return true;
}

function main(): void {
  const dir = getGeneratedArticlesDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();

  console.log(`\n📝 기존 글 ${files.length}편 마크업 정리\n`);

  let fixed = 0;
  for (const file of files) {
    if (fixArticleFile(path.join(dir, file))) fixed += 1;
  }

  console.log(`\n완료: ${fixed}편 수정, ${files.length - fixed}편 유지\n`);
}

main();
