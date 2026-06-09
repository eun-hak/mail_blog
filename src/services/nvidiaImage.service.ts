import fs from "node:fs";
import path from "node:path";
import {
  FLUX_IMAGE_HEIGHT,
  FLUX_IMAGE_WIDTH,
  FLUX_MAX_ATTEMPTS,
  FLUX_STEPS,
  NVIDIA_API_KEY,
  NVIDIA_FLUX_ENABLED,
  NVIDIA_FLUX_ENDPOINT,
} from "../config/nvidia.js";
import type { BlogCategorySlug } from "../types/article.types.js";
import { buildFluxPrompt } from "../utils/fluxImagePrompt.js";
import {
  isFluxGenerationSuccessful,
  isValidFluxJpegFile,
} from "../utils/fluxImage.validate.js";

export type GenerateFluxImageParams = {
  articleId: string;
  title: string;
  description: string;
  categorySlug: BlogCategorySlug;
  imageSearchQuery?: string;
  force?: boolean;
};

function hashSeed(value: string, offset = 0): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  const seed = (Math.abs(hash) + offset) % 2_147_483_647;
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

let lastRequestAt = 0;

async function throttleFlux(): Promise<void> {
  const gap = 1200;
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < gap) {
    await new Promise((resolve) => setTimeout(resolve, gap - elapsed));
  }
  lastRequestAt = Date.now();
}

type FluxApiResponse = {
  artifacts?: {
    base64?: string;
    finishReason?: string;
    seed?: number;
  }[];
};

async function callFluxApi(
  prompt: string,
  seed: number
): Promise<FluxApiResponse | null> {
  const res = await fetch(NVIDIA_FLUX_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      width: FLUX_IMAGE_WIDTH,
      height: FLUX_IMAGE_HEIGHT,
      seed,
      steps: FLUX_STEPS,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.warn(`NVIDIA Flux 생성 실패 (${res.status}): ${err.slice(0, 200)}`);
    return null;
  }

  return (await res.json()) as FluxApiResponse;
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

  if (!params.force && isValidFluxJpegFile(filePath)) {
    return publicPath;
  }

  if (params.force && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  for (let attempt = 0; attempt < FLUX_MAX_ATTEMPTS; attempt++) {
    await throttleFlux();

    const prompt = buildFluxPrompt({
      categorySlug: params.categorySlug,
      imageSearchQuery: params.imageSearchQuery,
      attempt,
    });
    const seed = hashSeed(params.articleId, attempt * 9973);

    const json = await callFluxApi(prompt, seed);
    const artifact = json?.artifacts?.[0];
    const base64 = artifact?.base64;
    const finishReason = artifact?.finishReason;

    if (!base64) {
      console.warn(`  ⚠ Flux 빈 응답 (${params.articleId}, 시도 ${attempt + 1})`);
      continue;
    }

    if (!isFluxGenerationSuccessful(finishReason)) {
      console.warn(
        `  ⚠ Flux finishReason=${finishReason} (${params.articleId}, 시도 ${attempt + 1})`
      );
      continue;
    }

    fs.writeFileSync(filePath, Buffer.from(base64, "base64"));

    if (!isValidFluxJpegFile(filePath)) {
      console.warn(
        `  ⚠ Flux 품질 검증 실패 (${params.articleId}, ${fs.statSync(filePath).size} bytes)`
      );
      fs.unlinkSync(filePath);
      continue;
    }

    console.log(`  🎨 Flux 저장: ${filename} (시도 ${attempt + 1})`);
    return publicPath;
  }

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return null;
}

/** 로컬 Flux JPEG 품질 검사 (불량 재생성용) */
export function isFluxImageFileValid(articleId: string): boolean {
  const filePath = path.join(
    getGeneratedImagesDir(),
    safeFilename(articleId)
  );
  return isValidFluxJpegFile(filePath);
}
