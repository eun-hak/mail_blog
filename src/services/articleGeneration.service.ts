import { GEMINI_MODEL } from "../config/gemini.js";
import type { GeneratedArticle } from "../types/article.types.js";
import { assertAllowedSender, toGeneratedArticle } from "../utils/articleMapper.js";
import { analyzeEmailToBlog } from "./gemini.service.js";
import { syncEmailsFromGmail } from "./emailSync.service.js";

export type GenerateArticlesOptions = {
  limit?: number;
  q?: string;
};

export type GenerateArticlesResult = {
  articles: GeneratedArticle[];
  query: string;
  limit: number;
  model: string;
};

const DEFAULT_ARTICLE_LIMIT = 2;

export async function generateArticlesFromGmail(
  options: GenerateArticlesOptions = {}
): Promise<GenerateArticlesResult> {
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_ARTICLE_LIMIT, 1), 5);

  const { emails, query } = await syncEmailsFromGmail({
    q: options.q,
    maxResults: limit,
  });

  if (emails.length === 0) {
    return {
      articles: [],
      query,
      limit,
      model: GEMINI_MODEL,
    };
  }

  const analyses = await Promise.all(
    emails.map(async (email) => {
      assertAllowedSender(email);
      const analysis = await analyzeEmailToBlog(email);
      return toGeneratedArticle(email, analysis);
    })
  );

  return {
    articles: analyses,
    query,
    limit,
    model: GEMINI_MODEL,
  };
}
