import { USE_MOCK_DATA } from "./config";
import { fetchMockArticles } from "./mock";
import type { ApiResponse, Article } from "./types";

function apiBase(): string {
  return process.env.API_URL ?? "http://localhost:3001";
}

export async function getArticles(): Promise<Article[]> {
  if (USE_MOCK_DATA) {
    return fetchMockArticles(30);
  }

  const res = await fetch(`${apiBase()}/api/articles/example`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("예시 글을 불러오지 못했습니다.");
  }

  const json = (await res.json()) as ApiResponse<Article[]>;
  if (!json.success) {
    throw new Error("API 응답 오류");
  }

  return json.data;
}
