import * as cheerio from "cheerio";
import type { gmail_v1 } from "googleapis";
import { decodeBase64Url } from "../utils/decodeBase64Url.js";

export type BodyExtractResult = {
  html: string | null;
  text: string | null;
};

function collectParts(
  payload: gmail_v1.Schema$MessagePart | undefined,
  htmlParts: string[],
  plainParts: string[]
): void {
  if (!payload) return;

  const mimeType = payload.mimeType ?? "";
  const data = payload.body?.data;

  if (data) {
    const decoded = decodeBase64Url(data);
    if (mimeType === "text/html") {
      htmlParts.push(decoded);
    } else if (mimeType === "text/plain") {
      plainParts.push(decoded);
    }
  }

  for (const part of payload.parts ?? []) {
    collectParts(part, htmlParts, plainParts);
  }
}

export function extractBodyFromPayload(
  payload: gmail_v1.Schema$MessagePart | undefined
): BodyExtractResult {
  const htmlParts: string[] = [];
  const plainParts: string[] = [];

  collectParts(payload, htmlParts, plainParts);

  const html = htmlParts.length > 0 ? htmlParts.join("\n") : null;
  const plain =
    plainParts.length > 0 ? plainParts.join("\n") : null;

  return { html, text: plain };
}

export function htmlToText(html: string | null): string | null {
  if (!html || html.trim() === "") return null;

  const $ = cheerio.load(html);
  $("script, style").remove();

  const text = $("body").length > 0 ? $("body").text() : $.root().text();

  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

export function getHeaderValue(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string
): string | null {
  if (!headers) return null;
  const found = headers.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase()
  );
  return found?.value ?? null;
}
