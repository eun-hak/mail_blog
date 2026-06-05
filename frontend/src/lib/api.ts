import type { ApiResponse, Article, ParsedEmail } from "./types";

export async function fetchEmails(limit = 20): Promise<ParsedEmail[]> {
  const res = await fetch(`/api/emails?limit=${limit}`);
  if (!res.ok) throw new Error("메일을 불러오지 못했습니다.");

  const json = (await res.json()) as ApiResponse<ParsedEmail[]>;
  if (!json.success) throw new Error("API 응답 오류");

  return json.data;
}

/** Gmail 최신 메일을 Gemini로 블로그 글 형식으로 변환한 결과 */
export async function fetchArticles(limit = 2): Promise<Article[]> {
  const res = await fetch(`/api/articles?limit=${limit}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as {
      success?: boolean;
      error?: { message?: string };
    } | null;
    const message = err?.error?.message ?? "블로그 글을 생성하지 못했습니다.";
    throw new Error(message);
  }

  const json = (await res.json()) as ApiResponse<Article[]>;
  if (!json.success) throw new Error("API 응답 오류");

  return json.data;
}

/** example/articles/*.md 에서 로드한 블로그 글 */
export async function fetchExampleArticles(): Promise<Article[]> {
  const res = await fetch("/api/articles/example");
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(err?.error?.message ?? "예시 글을 불러오지 못했습니다.");
  }

  const json = (await res.json()) as ApiResponse<Article[]>;
  if (!json.success) throw new Error("API 응답 오류");

  return json.data;
}
