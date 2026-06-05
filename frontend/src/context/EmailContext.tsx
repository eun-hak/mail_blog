import { createContext, useContext, type ReactNode } from "react";
import { useEmails } from "../hooks/useEmails";
import type { Article } from "../lib/types";

type EmailContextValue = ReturnType<typeof useEmails>;

const EmailContext = createContext<EmailContextValue | null>(null);

export function EmailProvider({ children }: { children: ReactNode }) {
  const value = useEmails(30);
  return (
    <EmailContext.Provider value={value}>{children}</EmailContext.Provider>
  );
}

export function useEmailContext() {
  const ctx = useContext(EmailContext);
  if (!ctx) throw new Error("useEmailContext must be used within EmailProvider");
  return ctx;
}

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
