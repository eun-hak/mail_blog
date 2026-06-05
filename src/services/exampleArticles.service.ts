import type { GeneratedArticle } from "../types/article.types.js";
import {
  listExampleMarkdownFiles,
  parseMarkdownArticleFile,
} from "../utils/markdownArticle.parser.js";

export type ExampleArticlesResult = {
  articles: GeneratedArticle[];
  source: "example";
  directory: string;
};

export function loadExampleArticles(): ExampleArticlesResult {
  const files = listExampleMarkdownFiles();
  const articles = files.map((file) => parseMarkdownArticleFile(file));

  return {
    articles,
    source: "example",
    directory: "example/articles",
  };
}
