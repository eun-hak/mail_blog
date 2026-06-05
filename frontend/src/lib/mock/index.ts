import type { Article } from "../types";
import { MOCK_ARTICLES } from "./articles";

export function fetchMockArticles(limit?: number): Promise<Article[]> {
  const data = limit ? MOCK_ARTICLES.slice(0, limit) : MOCK_ARTICLES;
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 300);
  });
}

export { MOCK_ARTICLES };
