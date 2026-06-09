import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogCategorySlug } from "../types/article.types.js";
import {
  extractSectionTitles,
  layoutArticleBody,
} from "../utils/articleBody.formatter.js";
import { createUniqueImageAssigner } from "../utils/articleImages.js";
import { isImageUrlAccessible } from "../utils/imageUrl.validate.js";
import { getGeneratedArticlesDir } from "../services/batchGeneration.service.js";
import { resolveArticleImageUrl } from "../services/articleImage.service.js";
import { NVIDIA_FLUX_ENABLED } from "../config/nvidia.js";
import { UNSPLASH_ENABLED } from "../config/unsplash.js";

function parseHighlights(content: string): string[] {
  const section = content.match(/## 핵심 요약\s*\n+([\s\S]*?)(?=\n## |\n*$)/);
  if (!section) return [];
  return [...section[1].matchAll(/^- (.+)$/gm)].map((m) => m[1].trim());
}

function extractRawBody(content: string): string {
  const section = content.match(/## 본문\s*\n+([\s\S]*)$/);
  return section ? section[1].trim() : content.trim();
}

function isValidHighlight(bullet: string): boolean {
  return (
    bullet.length >= 12 &&
    bullet.length <= 140 &&
    !bullet.startsWith("###") &&
    !bullet.includes("\n")
  );
}

/** 핵심 요약: 소제목(제목만) 또는 기존 유효 bullet 유지 */
function deriveHighlights(
  body: string,
  description: string,
  existing: string[] = []
): string[] {
  const validExisting = existing.filter(isValidHighlight);
  if (validExisting.length >= 3) return validExisting.slice(0, 5);

  const titles = extractSectionTitles(body);
  if (titles.length >= 2) return titles.slice(0, 4);

  const intro = body
    .replace(/^### [^\n]+\n+/m, "")
    .split(/\n\n### /)[0]
    ?.trim() ?? "";
  const introSentence = intro.match(/[^.?!…]+[.?!…]/)?.[0]?.trim();

  const bullets = [introSentence, ...titles].filter(
    (b): b is string => Boolean(b && isValidHighlight(b))
  );

  if (bullets.length >= 2) return bullets.slice(0, 4);

  return description
    .split(/[.?!…]/)
    .map((s) => s.trim())
    .filter((s) => isValidHighlight(s))
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

function fixArticleFile(filePath: string, imageUrl?: string): boolean {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const description =
    typeof data.description === "string" ? data.description : "";
  const rawBody = extractRawBody(content);
  const fixedBody = layoutArticleBody(rawBody);
  const highlights = deriveHighlights(
    fixedBody,
    description,
    parseHighlights(content)
  );

  const newContent = rebuildContent(description, highlights, fixedBody);
  const contentChanged = newContent.trim() !== content.trim();
  const imageChanged = imageUrl != null && data.imageUrl !== imageUrl;

  if (!contentChanged && !imageChanged) {
    console.log(`  ✓ 변경 없음: ${path.basename(filePath)}`);
    return false;
  }

  const bodyChars = fixedBody.replace(/\s/g, "").length;

  const frontmatter = {
    ...data,
    bodyChars,
    ...(imageUrl != null ? { imageUrl: String(imageUrl) } : {}),
  };
  const output = matter.stringify(newContent, frontmatter, {
    quoting: (value) =>
      typeof value === "string" &&
      (value.startsWith("/") || value.includes(":"))
        ? '"'
        : false,
  });
  fs.writeFileSync(filePath, output, "utf-8");
  console.log(`  ✓ 수정: ${path.basename(filePath)}`);
  return true;
}

function isCategorySlug(value: unknown): value is BlogCategorySlug {
  return (
    value === "ai" ||
    value === "tech" ||
    value === "economy" ||
    value === "policy" ||
    value === "issue"
  );
}

async function buildUnsplashImageAssignments(
  files: string[],
  dir: string
): Promise<Map<string, string>> {
  const usedUrls = new Set<string>();
  const map = new Map<string, string>();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const { data } = matter(fs.readFileSync(filePath, "utf-8"));
    const id =
      (typeof data.id === "string" && data.id) ||
      (typeof data.gmailMessageId === "string" && data.gmailMessageId) ||
      path.basename(file, ".md");
    const title = typeof data.title === "string" ? data.title : file;
    const description =
      typeof data.description === "string" ? data.description : "";
    const categorySlug = isCategorySlug(data.categorySlug)
      ? data.categorySlug
      : "economy";
    const imageSearchQuery =
      typeof data.imageSearchQuery === "string"
        ? data.imageSearchQuery
        : undefined;

    const imageUrl = await resolveArticleImageUrl({
      articleId: id,
      title,
      description,
      categorySlug,
      imageSearchQuery,
      usedUrls,
    });
    map.set(filePath, imageUrl);
    console.log(`  🖼 ${path.basename(file)} → ${imageUrl.slice(0, 60)}…`);
  }

  return map;
}

/** 404 등 깨진 imageUrl을 검증된 풀 URL로 교체 */
async function repairBrokenImageAssignments(
  files: string[],
  dir: string
): Promise<Map<string, string>> {
  const assigner = createUniqueImageAssigner();
  const map = new Map<string, string>();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const { data } = matter(fs.readFileSync(filePath, "utf-8"));
    const current =
      typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";

    if (current && (await isImageUrlAccessible(current))) continue;

    const id =
      (typeof data.id === "string" && data.id) ||
      (typeof data.gmailMessageId === "string" && data.gmailMessageId) ||
      path.basename(file, ".md");
    const replacement = assigner.assign(id);
    map.set(filePath, replacement);
    console.log(
      `  🔧 깨진 이미지 교체: ${path.basename(file)}${current ? "" : " (없음)"}`
    );
  }

  return map;
}

async function buildFluxImageAssignments(
  files: string[],
  dir: string
): Promise<Map<string, string>> {
  const usedUrls = new Set<string>();
  const map = new Map<string, string>();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const { data } = matter(fs.readFileSync(filePath, "utf-8"));
    const id =
      (typeof data.id === "string" && data.id) ||
      (typeof data.gmailMessageId === "string" && data.gmailMessageId) ||
      path.basename(file, ".md");
    const title = typeof data.title === "string" ? data.title : file;
    const description =
      typeof data.description === "string" ? data.description : "";
    const categorySlug = isCategorySlug(data.categorySlug)
      ? data.categorySlug
      : "economy";
    const imageSearchQuery =
      typeof data.imageSearchQuery === "string"
        ? data.imageSearchQuery
        : undefined;

    console.log(`  🎨 Flux 생성: ${path.basename(file)}`);
    const imageUrl = await resolveArticleImageUrl({
      articleId: id,
      title,
      description,
      categorySlug,
      imageSearchQuery,
      usedUrls,
      forceGenerate: true,
    });
    map.set(filePath, imageUrl);
  }

  return map;
}

async function main(): Promise<void> {
  const refreshImages = process.argv.includes("--refresh-images");
  const generateImages = process.argv.includes("--generate-images");
  const dir = getGeneratedArticlesDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();

  console.log(`\n📝 기존 글 ${files.length}편 마크업·이미지 정리\n`);

  const imageAssignments = new Map<string, string>();

  if (generateImages) {
    if (!NVIDIA_FLUX_ENABLED) {
      console.error(
        "NVIDIA_API_KEY(nvapi-...)가 없습니다. .env에 키를 추가한 뒤 다시 실행하세요.\n"
      );
      process.exit(1);
    }
    console.log("NVIDIA Flux로 주제별 썸네일을 생성합니다…\n");
    const generated = await buildFluxImageAssignments(files, dir);
    for (const [filePath, url] of generated) {
      imageAssignments.set(filePath, url);
    }
    console.log("");
  } else {
    const repaired = await repairBrokenImageAssignments(files, dir);
    for (const [filePath, url] of repaired) {
      imageAssignments.set(filePath, url);
    }

    if (refreshImages) {
    if (!UNSPLASH_ENABLED) {
      console.error(
        "UNSPLASH_ACCESS_KEY가 없습니다. .env에 키를 추가한 뒤 다시 실행하세요.\n"
      );
      process.exit(1);
    }
    console.log("Unsplash에서 주제별 썸네일을 다시 검색합니다…\n");
    const refreshed = await buildUnsplashImageAssignments(files, dir);
    for (const [filePath, url] of refreshed) {
      imageAssignments.set(filePath, url);
    }
    console.log("");
    }
  }

  let fixed = 0;
  for (const file of files) {
    const filePath = path.join(dir, file);
    const imageUrl = imageAssignments.get(filePath);
    if (fixArticleFile(filePath, imageUrl)) fixed += 1;
  }

  console.log(`\n완료: ${fixed}편 수정, ${files.length - fixed}편 유지\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
