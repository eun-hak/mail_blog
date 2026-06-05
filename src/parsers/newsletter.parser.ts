import * as cheerio from "cheerio";

export type NewsletterLink = {
  text: string;
  href: string;
};

export type MarketInfo = {
  kospi: string | null;
  kosdaq: string | null;
  usdKrw: string | null;
};

export type ParsedNewsletter = {
  title: string | null;
  summaryCandidate: string | null;
  links: NewsletterLink[];
  marketInfo: MarketInfo;
};

const MARKET_PATTERNS: Record<keyof MarketInfo, RegExp[]> = {
  kospi: [
    /코스피\s*[:：]?\s*([\d,.\-+％%]+(?:\s*[\d,.\-+％%]+)?)/i,
    /KOSPI\s*[:：]?\s*([\d,.\-+％%]+)/i,
  ],
  kosdaq: [
    /코스닥\s*[:：]?\s*([\d,.\-+％%]+(?:\s*[\d,.\-+％%]+)?)/i,
    /KOSDAQ\s*[:：]?\s*([\d,.\-+％%]+)/i,
  ],
  usdKrw: [
    /원[-\s]?달러\s*환율\s*[:：]?\s*([\d,.\-+]+)/i,
    /원달러\s*환율\s*[:：]?\s*([\d,.\-+]+)/i,
    /달러\s*환율\s*[:：]?\s*([\d,.\-+]+)/i,
    /USD\/KRW\s*[:：]?\s*([\d,.\-+]+)/i,
  ],
};

function extractByPatterns(
  text: string,
  patterns: RegExp[]
): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return null;
}

export function extractMarketInfo(text: string): MarketInfo {
  return {
    kospi: extractByPatterns(text, MARKET_PATTERNS.kospi),
    kosdaq: extractByPatterns(text, MARKET_PATTERNS.kosdaq),
    usdKrw: extractByPatterns(text, MARKET_PATTERNS.usdKrw),
  };
}

export function extractLinksFromHtml(
  html: string | null
): NewsletterLink[] {
  if (!html) return [];

  const $ = cheerio.load(html);
  const links: NewsletterLink[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
      return;
    }

    const text = $(el).text().replace(/\s+/g, " ").trim() || href;
    const key = `${text}|${href}`;
    if (seen.has(key)) return;
    seen.add(key);

    links.push({ text, href });
  });

  return links;
}

function buildSummaryCandidate(text: string): string | null {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20);

  return lines[0] ?? null;
}

export function parseNewsletter(input: {
  subject: string | null;
  html: string | null;
  text: string | null;
}): ParsedNewsletter {
  const contentText = input.text ?? "";
  const marketInfo = extractMarketInfo(contentText);
  const links = extractLinksFromHtml(input.html);

  return {
    title: input.subject,
    summaryCandidate: buildSummaryCandidate(contentText),
    links,
    marketInfo,
  };
}
