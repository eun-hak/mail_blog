import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogCategorySlug } from "../types/article.types.js";
import { layoutArticleBody } from "../utils/articleBody.formatter.js";
import {
  hasValidHighlights,
  sanitizeHighlights,
} from "../utils/articleContent.validate.js";
import { createUniqueImageAssigner } from "../utils/articleImages.js";
import { isImageUrlAccessible } from "../utils/imageUrl.validate.js";
import { getGeneratedArticlesDir } from "../services/batchGeneration.service.js";
import { resolveArticleImageUrl } from "../services/articleImage.service.js";
import { isFluxImageFileValid } from "../services/nvidiaImage.service.js";
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

function matterStringifyOptions() {
  return {
    quoting: (value: unknown) =>
      typeof value === "string" &&
      (value.startsWith("/") || value.includes(":"))
        ? ('"' as const)
        : false,
  };
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

function stripImageQuery(url: string): string {
  return url.split("?")[0] ?? url;
}

function withImageCacheBuster(publicPath: string): string {
  return `${stripImageQuery(publicPath)}?v=${Date.now()}`;
}

/** imageUrl만 frontmatter에 반영. 본문·핵심 요약은 건드리지 않음 */
function updateImageUrlOnly(filePath: string, imageUrl: string): boolean {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const current =
    typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";

  if (current === imageUrl) {
    console.log(`  ✓ 변경 없음: ${path.basename(filePath)}`);
    return false;
  }

  const output = matter.stringify(
    content,
    { ...data, imageUrl: String(imageUrl) },
    matterStringifyOptions() as Parameters<typeof matter.stringify>[2]
  );
  fs.writeFileSync(filePath, output, "utf-8");
  console.log(`  🖼 imageUrl 수정: ${path.basename(filePath)}`);
  return true;
}

/** --fix-markup 전용: 깨진 highlights만 복구, ### 같은 줄 분리만 수행 */
function fixArticleMarkup(filePath: string, imageUrl?: string): boolean {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const description =
    typeof data.description === "string" ? data.description : "";
  const existingHighlights = parseHighlights(content);
  const rawBody = extractRawBody(content);
  const fixedBody = layoutArticleBody(rawBody, { relayout: false });

  const highlightsBroken = !hasValidHighlights(existingHighlights);
  const highlights = highlightsBroken
    ? sanitizeHighlights(existingHighlights, {
        description,
        body: fixedBody,
      })
    : existingHighlights;

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
  const output = matter.stringify(newContent, frontmatter, matterStringifyOptions() as Parameters<typeof matter.stringify>[2]);
  fs.writeFileSync(filePath, output, "utf-8");
  console.log(`  ✓ 마크업 수정: ${path.basename(filePath)}`);
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
      skipFlux: true,
    });
    map.set(filePath, imageUrl);
    console.log(`  🖼 ${path.basename(file)} → ${imageUrl.slice(0, 60)}…`);
  }

  return map;
}

/** 404·불량 Flux JPEG 자동 교체 */
async function repairBrokenImageAssignments(
  files: string[],
  dir: string
): Promise<Map<string, string>> {
  const assigner = createUniqueImageAssigner();
  const usedUrls = new Set<string>();
  const map = new Map<string, string>();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const { data } = matter(fs.readFileSync(filePath, "utf-8"));
    const current =
      typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
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

    if (current && (await isImageUrlAccessible(current))) {
      if (
        NVIDIA_FLUX_ENABLED &&
        current.startsWith("/api/media/images/") &&
        !isFluxImageFileValid(id)
      ) {
        console.log(`  🔧 불량 Flux 이미지 재생성: ${path.basename(file)}`);
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
      continue;
    }

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
  const fixMarkup = process.argv.includes("--fix-markup");
  const bumpImageCache = process.argv.includes("--bump-image-cache");
  const refreshImages = process.argv.includes("--refresh-images");
  const generateImages = process.argv.includes("--generate-images");
  const dir = getGeneratedArticlesDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();

  if (fixMarkup) {
    console.log(`\n📝 기존 글 ${files.length}편 마크업 정리 (--fix-markup)\n`);
  } else if (bumpImageCache) {
    console.log(
      `\n🔄 기존 글 ${files.length}편 imageUrl 캐시 무효화 (--bump-image-cache)\n`
    );
  } else {
    console.log(`\n🖼 기존 글 ${files.length}편 이미지 정리 (본문은 수정하지 않음)\n`);
  }

  const imageAssignments = new Map<string, string>();

  if (bumpImageCache) {
    for (const file of files) {
      const filePath = path.join(dir, file);
      const { data } = matter(fs.readFileSync(filePath, "utf-8"));
      const current =
        typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
      if (current.startsWith("/api/media/images/")) {
        imageAssignments.set(filePath, stripImageQuery(current));
      }
    }
  } else if (generateImages) {
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

    if (fixMarkup) {
      if (fixArticleMarkup(filePath, imageUrl)) fixed += 1;
      continue;
    }

    if (imageUrl != null) {
      if (updateImageUrlOnly(filePath, withImageCacheBuster(imageUrl))) {
        fixed += 1;
      }
      continue;
    }

    console.log(`  ✓ 변경 없음: ${path.basename(filePath)}`);
  }

  console.log(`\n완료: ${fixed}편 수정, ${files.length - fixed}편 유지\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
