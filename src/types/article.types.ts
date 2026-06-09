import type { MarketInfo } from "../parsers/newsletter.parser.js";

export type BlogCategorySlug = "ai" | "tech" | "economy" | "policy" | "issue";

export type GeminiBlogAnalysis = {
  title: string;
  description: string;
  category: string;
  categorySlug: BlogCategorySlug;
  /** 이번 글에 적용한 서술 스타일 (예: 질문형 칼럼, 현장감 있는 해설) */
  writingStyle: string;
  body: string;
  highlights: string[];
  marketInfo: MarketInfo;
  /** Unsplash 검색용 영어 키워드 (2~4단어) */
  imageSearchQuery?: string;
};

export type GeneratedArticle = {
  id: string;
  title: string;
  description: string;
  category: string;
  categorySlug: BlogCategorySlug;
  source: "UPPITY" | "DAILY_BYTE";
  date: string;
  relativeTime: string;
  readMinutes: number;
  imageUrl: string;
  text: string;
  marketInfo: MarketInfo;
  author: string;
  highlights: string[];
  writingStyle: string;
  gmailMessageId: string;
  analyzedAt: string;
  /** Unsplash 검색에 사용한 영어 키워드 (md frontmatter 저장용) */
  imageSearchQuery?: string;
};
