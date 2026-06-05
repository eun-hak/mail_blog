export type MarketInfo = {
  kospi: string | null;
  kosdaq: string | null;
  usdKrw: string | null;
};

export type ParsedNewsletter = {
  title: string | null;
  summaryCandidate: string | null;
  links: { text: string; href: string }[];
  marketInfo: MarketInfo;
};

export type ParsedEmail = {
  gmailMessageId: string;
  subject: string | null;
  from: string | null;
  to: string | null;
  date: string | null;
  html: string | null;
  text: string | null;
  parsed: ParsedNewsletter;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: {
    count?: number;
    query?: string;
    limit?: number;
    allowedSenders?: { label: string; email: string }[];
  };
};

export type Article = {
  id: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  source: "UPPITY" | "DAILY_BYTE";
  date: string;
  relativeTime: string;
  readMinutes: number;
  imageUrl: string;
  text: string;
  marketInfo: MarketInfo;
  author: string;
  highlights?: string[];
  writingStyle?: string;
};

export type CategorySlug =
  | "ai"
  | "tech"
  | "economy"
  | "policy"
  | "issue";
