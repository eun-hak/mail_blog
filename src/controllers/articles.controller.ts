import type { Request, Response } from "express";
import { generateArticlesFromGmail } from "../services/articleGeneration.service.js";
import { loadExampleArticles } from "../services/exampleArticles.service.js";
import type { ApiSuccessResponse } from "../types/api.types.js";
import type { GeneratedArticle } from "../types/article.types.js";

function parseLimit(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 2;
  return Math.min(Math.floor(parsed), 5);
}

export async function listArticles(req: Request, res: Response): Promise<void> {
  const limit = parseLimit(req.query.limit);
  const q =
    typeof req.query.q === "string" && req.query.q.trim() !== ""
      ? req.query.q.trim()
      : undefined;

  const { articles, query, model } = await generateArticlesFromGmail({
    limit,
    q,
  });

  const body: ApiSuccessResponse<GeneratedArticle[]> = {
    success: true,
    data: articles,
    meta: {
      count: articles.length,
      limit,
      query,
      model,
      generatedAt: new Date().toISOString(),
    },
  };

  res.json(body);
}

export async function listExampleArticles(
  _req: Request,
  res: Response
): Promise<void> {
  const { articles, directory } = loadExampleArticles();

  const body: ApiSuccessResponse<GeneratedArticle[]> = {
    success: true,
    data: articles,
    meta: {
      count: articles.length,
      source: "example",
      directory,
      loadedAt: new Date().toISOString(),
    },
  };

  res.json(body);
}
