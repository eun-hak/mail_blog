import {
  DEFAULT_MAX_RESULTS,
  DEFAULT_SEARCH_QUERY,
} from "../config/gmail.js";
import {
  ALLOWED_NEWSLETTERS,
  isAllowedNewsletterSender,
} from "../config/newsletters.js";
import { getAuthenticatedClient } from "./gmailAuth.service.js";
import { fetchAndParseEmails } from "./gmail.service.js";
import type { ParsedEmail } from "../types/email.types.js";

export type SyncEmailsOptions = {
  q?: string;
  maxResults?: number;
};

export type SyncEmailsResult = {
  emails: ParsedEmail[];
  query: string;
  maxResults: number;
  allowedSenders: typeof ALLOWED_NEWSLETTERS;
};

function filterToAllowedSenders(emails: ParsedEmail[]): ParsedEmail[] {
  return emails.filter((email) => isAllowedNewsletterSender(email.from));
}

export async function syncEmailsFromGmail(
  options: SyncEmailsOptions = {}
): Promise<SyncEmailsResult> {
  const query = options.q ?? DEFAULT_SEARCH_QUERY;
  const maxResults = options.maxResults ?? DEFAULT_MAX_RESULTS;

  const auth = await getAuthenticatedClient();
  const fetched = await fetchAndParseEmails(auth, query, maxResults);
  const emails = filterToAllowedSenders(fetched);

  return {
    emails,
    query,
    maxResults,
    allowedSenders: ALLOWED_NEWSLETTERS,
  };
}
