import type { BlogCategorySlug } from "../types/article.types.js";
import { ARTICLE_IMAGES } from "../utils/articleImages.js";
import { isImageUrlAccessible } from "../utils/imageUrl.validate.js";
import { NVIDIA_FLUX_ENABLED } from "../config/nvidia.js";
import { UNSPLASH_ENABLED } from "../config/unsplash.js";
import { generateFluxArticleImage } from "./nvidiaImage.service.js";
import { searchUnsplashImage } from "./unsplash.service.js";

const CATEGORY_FALLBACK_QUERY: Record<BlogCategorySlug, string> = {
  ai: "artificial intelligence technology",
  tech: "technology innovation computer",
  economy: "finance stock market economy",
  policy: "government policy business",
  issue: "news business society",
};

export type ResolveArticleImageParams = {
  articleId: string;
  title: string;
  description: string;
  categorySlug: BlogCategorySlug;
  imageSearchQuery?: string;
  usedUrls?: Set<string>;
  forceGenerate?: boolean;
};

function buildFallbackQuery(
  title: string,
  categorySlug: BlogCategorySlug
): string {
  const categoryQuery = CATEGORY_FALLBACK_QUERY[categorySlug];
  const latinTokens =
    title.match(/[A-Za-z][A-Za-z0-9+\-]*/g)?.slice(0, 4).join(" ") ?? "";
  if (latinTokens.length >= 3) {
    return `${latinTokens} ${categoryQuery}`.slice(0, 100);
  }
  const ascii = title.replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ").trim();
  if (ascii.length >= 8) {
    return `${ascii} ${categoryQuery}`.slice(0, 100);
  }
  return categoryQuery;
}

async function pickVerifiedFallback(
  seed: string,
  usedUrls?: Set<string>
): Promise<string> {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }
  const start = Math.abs(hash) % ARTICLE_IMAGES.length;

  for (let offset = 0; offset < ARTICLE_IMAGES.length; offset++) {
    const candidate = ARTICLE_IMAGES[(start + offset) % ARTICLE_IMAGES.length];
    if (!usedUrls?.has(candidate)) return candidate;
  }
  return ARTICLE_IMAGES[start];
}

/** NVIDIA Flux → Unsplash → 검증된 풀 순으로 썸네일 URL 결정 */
export async function resolveArticleImageUrl(
  params: ResolveArticleImageParams
): Promise<string> {
  if (NVIDIA_FLUX_ENABLED) {
    const generated = await generateFluxArticleImage({
      articleId: params.articleId,
      title: params.title,
      description: params.description,
      categorySlug: params.categorySlug,
      imageSearchQuery: params.imageSearchQuery,
      force: params.forceGenerate,
    });
    if (generated) {
      params.usedUrls?.add(generated);
      return generated;
    }
  }

  if (UNSPLASH_ENABLED) {
    const primaryQuery =
      params.imageSearchQuery?.trim() ||
      buildFallbackQuery(params.title, params.categorySlug);

    let url = await searchUnsplashImage(primaryQuery, {
      excludeUrls: params.usedUrls,
    });

    if (!url && params.imageSearchQuery?.trim()) {
      url = await searchUnsplashImage(
        buildFallbackQuery(params.title, params.categorySlug),
        { excludeUrls: params.usedUrls }
      );
    }

    if (url && (await isImageUrlAccessible(url))) {
      params.usedUrls?.add(url);
      return url;
    }
  }

  const fallback = await pickVerifiedFallback(params.articleId, params.usedUrls);
  params.usedUrls?.add(fallback);
  return fallback;
}
