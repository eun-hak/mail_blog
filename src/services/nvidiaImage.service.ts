import fs from "node:fs";
import path from "node:path";
import {
  FLUX_IMAGE_HEIGHT,
  FLUX_IMAGE_WIDTH,
  FLUX_STEPS,
  NVIDIA_API_KEY,
  NVIDIA_FLUX_ENABLED,
  NVIDIA_FLUX_ENDPOINT,
} from "../config/nvidia.js";
import type { BlogCategorySlug } from "../types/article.types.js";

export type GenerateFluxImageParams = {
  articleId: string;
  title: string;
  description: string;
  categorySlug: BlogCategorySlug;
  imageSearchQuery?: string;
  force?: boolean;
};

function hashSeed(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  const seed = Math.abs(hash) % 2_147_483_647;
  return seed === 0 ? 1 : seed;
}

function safeFilename(articleId: string): string {
  return `${articleId.replace(/[^a-zA-Z0-9_-]/g, "_")}.jpg`;
}

export function getGeneratedImagesDir(): string {
  return path.join(process.cwd(), "generated", "images");
}

export function getPublicImagePath(articleId: string): string {
  return `/api/media/images/${safeFilename(articleId)}`;
}

function buildFluxPrompt(params: GenerateFluxImageParams): string {
  const keywords =
    params.imageSearchQuery?.trim() ||
    params.title.match(/[A-Za-z][A-Za-z0-9+\-]*/g)?.slice(0, 5).join(" ") ||
    params.categorySlug;

  return [
    "Professional editorial blog header photograph for a finance and technology news article.",
    `Subject: ${keywords}.`,
    `Article theme: ${params.title}.`,
    "Cinematic lighting, photorealistic, modern, clean composition, shallow depth of field.",
    "No text, no logos, no watermark, no collage.",
  ].join(" ");
}

let lastRequestAt = 0;

async function throttleFlux(): Promise<void> {
  const gap = 1200;
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < gap) {
    await new Promise((resolve) => setTimeout(resolve, gap - elapsed));
  }
  lastRequestAt = Date.now();
}

/** Flux.1-schnell로 썸네일 생성 후 로컬 저장, 공개 URL 반환 */
export async function generateFluxArticleImage(
  params: GenerateFluxImageParams
): Promise<string | null> {
  if (!NVIDIA_FLUX_ENABLED) return null;

  const dir = getGeneratedImagesDir();
  fs.mkdirSync(dir, { recursive: true });

  const filename = safeFilename(params.articleId);
  const filePath = path.join(dir, filename);
  const publicPath = getPublicImagePath(params.articleId);

  if (!params.force && fs.existsSync(filePath)) {
    return publicPath;
  }

  await throttleFlux();

  const res = await fetch(NVIDIA_FLUX_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: buildFluxPrompt(params),
      width: FLUX_IMAGE_WIDTH,
      height: FLUX_IMAGE_HEIGHT,
      seed: hashSeed(params.articleId),
      steps: FLUX_STEPS,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.warn(`NVIDIA Flux 생성 실패 (${res.status}): ${err.slice(0, 200)}`);
    return null;
  }

  const json = (await res.json()) as {
    artifacts?: { base64?: string }[];
  };
  const base64 = json.artifacts?.[0]?.base64;
  if (!base64) {
    console.warn("NVIDIA Flux 응답에 이미지 데이터가 없습니다.");
    return null;
  }

  fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
  console.log(`  🎨 Flux 저장: ${filename}`);
  return publicPath;
}
