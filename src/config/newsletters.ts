export type NewsletterSender = {
  id: string;
  label: string;
  email: string;
};

/** 수신·파싱 대상 뉴스레터 (Gmail 표시 이름 기준) */
export const ALLOWED_NEWSLETTERS: NewsletterSender[] = [
  {
    id: "uppity",
    label: "UPPITY",
    email: "moneyletter@uppity.co.kr",
  },
  {
    id: "daily_byte",
    label: "DAILY_BYTE",
    email: "byteteam365@mydailybyte.com",
  },
];

const DEFAULT_NEWER_THAN_DAYS = 30;

export function buildNewsletterSearchQuery(
  newerThanDays: number = DEFAULT_NEWER_THAN_DAYS
): string {
  const fromClause = ALLOWED_NEWSLETTERS.map((s) => `from:${s.email}`).join(
    " OR "
  );
  return `(${fromClause}) newer_than:${newerThanDays}d`;
}

function parseDisplayName(from: string): string {
  const match = from.match(/^([^<]+)</);
  const raw = match ? match[1] : from;
  return raw.trim().replace(/^["']|["']$/g, "");
}

export function isAllowedNewsletterSender(from: string | null): boolean {
  if (!from) return false;

  const normalizedFrom = from.toLowerCase();
  const displayName = parseDisplayName(from);

  return ALLOWED_NEWSLETTERS.some((sender) => {
    const labelMatch =
      displayName.toUpperCase() === sender.label.toUpperCase();
    const emailMatch = normalizedFrom.includes(sender.email.toLowerCase());
    return labelMatch && emailMatch;
  });
}
