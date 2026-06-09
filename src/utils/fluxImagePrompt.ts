import type { BlogCategorySlug } from "../types/article.types.js";

/**
 * 카테고리별 기본 장면 — 동전·신문·AI 글자 등 텍스트 유발 소재 회피
 */
const CATEGORY_SCENES: Record<BlogCategorySlug, string> = {
  ai: "soft blue bokeh light streaks in a dark modern hallway, abstract atmosphere",
  tech: "silicon wafer rainbow reflection macro on matte black surface, cool tone",
  economy:
    "empty modern office with floor to ceiling windows and blurred city skyline, morning light",
  policy:
    "classical marble building columns at golden hour, symmetrical documentary photo",
  issue: "wide city skyline at sunset with soft atmospheric haze, muted colors",
};

const TEXT_TRIGGER_WORDS =
  /\b(text|logo|sign|signage|headline|newspaper|magazine|screen|monitor|ui|chart|label|caption|watermark|subtitle|letter|number|typography|coin|coins|currency|stock|market|business|headline)\b/i;

/** 프롬프트에 넣으면 Flux가 글자로 그리는 약어·브랜드 */
const LITERAL_TEXT_TOKENS =
  /\b(AI|LG|GPU|CPU|PC|IPO|HBM|USD|KRW|KOSPI|KOSDAQ|NVIDIA|TOSS|Ferrari|OpenAI|SpaceX)\b/gi;

/** imageSearchQuery에서 영어 장면 묘사만 추출 (위험 단어 제거) */
export function extractVisualSceneQuery(raw?: string): string | null {
  if (!raw?.trim()) return null;

  let english = raw
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(LITERAL_TEXT_TOKENS, " ")
    .replace(/\s+/g, " ")
    .trim();

  english = english
    .replace(TEXT_TRIGGER_WORDS, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (english.length < 6) return null;
  return english.slice(0, 90);
}

export function buildFluxPrompt(params: {
  categorySlug: BlogCategorySlug;
  imageSearchQuery?: string;
  attempt?: number;
}): string {
  const attempt = params.attempt ?? 0;
  const baseScene = CATEGORY_SCENES[params.categorySlug];

  const customScene =
    attempt === 0 ? extractVisualSceneQuery(params.imageSearchQuery) : null;

  const scene =
    attempt >= 2
      ? `${baseScene}, very simple composition, soft focus background`
      : attempt >= 1
        ? baseScene
        : customScene ?? baseScene;

  return [
    scene,
    "Professional editorial photograph for a news website hero image.",
    "Photorealistic, natural lighting, shallow depth of field, uncluttered frame.",
    "Important: absolutely no text, no letters, no numbers, no words, no logos, no watermarks, no signs, no subtitles, no user interface.",
  ].join(" ");
}
