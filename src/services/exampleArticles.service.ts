import type { GeneratedArticle } from "../types/article.types.js";
import {
  getGeneratedArticlesDir,
  listExampleMarkdownFiles,
  parseMarkdownArticleFile,
  sortArticlesByRecency,
} from "../utils/markdownArticle.parser.js";

export type ExampleArticlesResult = {
  articles: GeneratedArticle[];
  source: "example";
  directory: string;
};

export function loadExampleArticles(): ExampleArticlesResult {
  const files = listExampleMarkdownFiles();
  const articles = sortArticlesByRecency(
    files.map((file) => parseMarkdownArticleFile(file))
  );
  const fromGenerated = files.some((f) => f.includes(`${getGeneratedArticlesDir()}`));

  return {
    articles,
    source: "example",
    directory: fromGenerated ? "generated/articles" : "example/articles",
  };
}
