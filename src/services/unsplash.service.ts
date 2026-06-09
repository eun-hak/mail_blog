import { UNSPLASH_ACCESS_KEY } from "../config/unsplash.js";
import { isImageUrlAccessible } from "../utils/imageUrl.validate.js";

type UnsplashSearchResponse = {
  results?: Array<{
    urls?: { regular?: string };
  }>;
};

function normalizeUnsplashUrl(url: string): string {
  const base = url.split("?")[0];
  return `${base}?w=800&q=80`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastRequestAt = 0;
const MIN_REQUEST_GAP_MS = 300;

async function throttleUnsplash(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_REQUEST_GAP_MS) {
    await sleep(MIN_REQUEST_GAP_MS - elapsed);
  }
  lastRequestAt = Date.now();
}

/** Unsplash Search API로 주제 관련 이미지 URL 조회 */
export async function searchUnsplashImage(
  query: string,
  options: { excludeUrls?: Set<string>; page?: number } = {}
): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;

  const trimmed = query.trim();
  if (!trimmed) return null;

  await throttleUnsplash();

  const params = new URLSearchParams({
    query: trimmed,
    per_page: "8",
    orientation: "landscape",
    content_filter: "high",
    page: String(options.page ?? 1),
  });

  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });

  if (!res.ok) {
    console.warn(`Unsplash 검색 실패 (${res.status}): ${trimmed}`);
    return null;
  }

  const data = (await res.json()) as UnsplashSearchResponse;
  for (const photo of data.results ?? []) {
    const regular = photo.urls?.regular;
    if (!regular) continue;
    const url = normalizeUnsplashUrl(regular);
    if (options.excludeUrls?.has(url)) continue;
    if (await isImageUrlAccessible(url)) return url;
  }

  if ((options.page ?? 1) === 1) {
    return searchUnsplashImage(trimmed, { ...options, page: 2 });
  }

  return null;
}
