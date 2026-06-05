import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import type { gmail_v1 } from "googleapis";
import { DEFAULT_MAX_RESULTS } from "../config/gmail.js";
import {
  extractBodyFromPayload,
  getHeaderValue,
  htmlToText,
} from "../parsers/emailBody.parser.js";
import { parseNewsletter } from "../parsers/newsletter.parser.js";
import type { ParsedEmail } from "../types/email.types.js";

class GmailServiceError extends Error {
  constructor(
    message: string,
    public readonly step: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "GmailServiceError";
  }
}

function getGmailClient(auth: OAuth2Client): gmail_v1.Gmail {
  return google.gmail({ version: "v1", auth });
}

export async function listMessageIds(
  auth: OAuth2Client,
  q: string,
  maxResults: number = DEFAULT_MAX_RESULTS
): Promise<string[]> {
  const gmail = getGmailClient(auth);

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q,
      maxResults,
    });

    const messages = response.data.messages ?? [];
    return messages
      .map((m) => m.id)
      .filter((id): id is string => Boolean(id));
  } catch (error) {
    throw new GmailServiceError(
      `메일 목록 조회 실패 (q="${q}"): ${error instanceof Error ? error.message : String(error)}`,
      "messages.list",
      error
    );
  }
}

export async function getMessage(
  auth: OAuth2Client,
  messageId: string
): Promise<gmail_v1.Schema$Message> {
  const gmail = getGmailClient(auth);

  try {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    if (!response.data) {
      throw new Error("응답 데이터가 비어 있습니다.");
    }

    return response.data;
  } catch (error) {
    throw new GmailServiceError(
      `메일 상세 조회 실패 (messageId="${messageId}"): ${error instanceof Error ? error.message : String(error)}`,
      "messages.get",
      error
    );
  }
}

export function mapMessageToParsedEmail(
  message: gmail_v1.Schema$Message
): ParsedEmail {
  const messageId = message.id ?? "unknown";
  const headers = message.payload?.headers;

  const subject = getHeaderValue(headers, "Subject");
  const from = getHeaderValue(headers, "From");
  const to = getHeaderValue(headers, "To");
  const date = getHeaderValue(headers, "Date");

  const { html: rawHtml, text: rawPlain } = extractBodyFromPayload(
    message.payload
  );

  const html = rawHtml;
  const plainFromHtml = htmlToText(html);
  const text = plainFromHtml ?? rawPlain ?? null;

  const parsed = parseNewsletter({
    subject,
    html,
    text,
  });

  return {
    gmailMessageId: messageId,
    subject,
    from,
    to,
    date,
    html,
    text,
    parsed,
  };
}

export async function fetchAndParseEmails(
  auth: OAuth2Client,
  q: string,
  maxResults: number = DEFAULT_MAX_RESULTS
): Promise<ParsedEmail[]> {
  const messageIds = await listMessageIds(auth, q, maxResults);
  const results: ParsedEmail[] = [];

  for (const messageId of messageIds) {
    try {
      const message = await getMessage(auth, messageId);
      results.push(mapMessageToParsedEmail(message));
    } catch (error) {
      if (error instanceof GmailServiceError) {
        console.warn(`[${error.step}] messageId=${messageId} 건너뜀: ${error.message}`);
        continue;
      }
      console.warn(
        `[parse] messageId=${messageId} 건너뜀: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return results;
}

export { GmailServiceError };
