import { useCallback, useEffect, useState } from "react";
import { fetchExampleArticles } from "../lib/api";
import { USE_MOCK_DATA } from "../lib/config";
import { fetchMockArticles } from "../lib/mock";
import type { Article } from "../lib/types";

export function useEmails(limit = 20) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"mock" | "example">(
    USE_MOCK_DATA ? "mock" : "example"
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        const mock = await fetchMockArticles(limit);
        setArticles(mock);
        setDataSource("mock");
        return;
      }

      const example = await fetchExampleArticles();
      setArticles(example);
      setDataSource("example");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  const getById = useCallback(
    (id: string) => articles.find((a) => a.id === id),
    [articles]
  );

  return { articles, loading, error, reload: load, getById, dataSource };
}
