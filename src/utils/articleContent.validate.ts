import { extractSectionTitles } from "./articleBody.formatter.js";

export const HIGHLIGHT_MIN_LEN = 12;
export const HIGHLIGHT_MAX_LEN = 140;

export function isValidHighlight(bullet: string): boolean {
  return (
    bullet.length >= HIGHLIGHT_MIN_LEN &&
    bullet.length <= HIGHLIGHT_MAX_LEN &&
    !bullet.startsWith("###") &&
    !bullet.includes("\n")
  );
}

export function hasValidHighlights(highlights: string[]): boolean {
  return highlights.filter(isValidHighlight).length >= 3;
}

/** Gemini highlights 우선. 부족하거나 깨졌을 때만 소제목/설명에서 복원 */
export function sanitizeHighlights(
  highlights: string[],
  fallback: { description: string; body?: string }
): string[] {
  const validExisting = highlights.filter(isValidHighlight);
  if (validExisting.length >= 3) return validExisting.slice(0, 5);

  const body = fallback.body ?? "";
  const titles = body ? extractSectionTitles(body) : [];
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

  return fallback.description
    .split(/[.?!…]/)
    .map((s) => s.trim())
    .filter((s) => isValidHighlight(s))
    .slice(0, 4);
}

/** 같은 줄에 본문이 붙은 ### 등 구조 이상 감지 */
export function findBodyStructureIssues(body: string): string[] {
  const issues: string[] = [];

  for (const match of body.matchAll(/^### (.+)$/gm)) {
    const line = match[1].trim();
    if (line.length > 80) {
      issues.push(`소제목이 80자를 넘습니다 (${line.length}자)`);
    }
  }

  return issues;
}
