import type { Article } from "./types";

export function filterByCategory(
  articles: Article[],
  slug: string
): Article[] {
  return articles.filter((a) => a.categorySlug === slug);
}

export function searchArticles(articles: Article[], q: string): Article[] {
  const keyword = q.trim().toLowerCase();
  if (!keyword) return articles;
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(keyword) ||
      a.description.toLowerCase().includes(keyword) ||
      a.text.toLowerCase().includes(keyword)
  );
}

export function getArticleById(
  articles: Article[],
  id: string
): Article | undefined {
  return articles.find((a) => a.id === id);
}
