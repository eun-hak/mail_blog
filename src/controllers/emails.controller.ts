import type { Request, Response } from "express";
import {
  DEFAULT_MAX_RESULTS,
  DEFAULT_SEARCH_QUERY,
} from "../config/gmail.js";
import { syncEmailsFromGmail } from "../services/emailSync.service.js";
import type { ApiSuccessResponse } from "../types/api.types.js";
import type { ParsedEmail } from "../types/email.types.js";

function parseLimit(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_MAX_RESULTS;
  }
  return Math.min(Math.floor(parsed), 50);
}

export async function listEmails(req: Request, res: Response): Promise<void> {
  const q =
    typeof req.query.q === "string" && req.query.q.trim() !== ""
      ? req.query.q.trim()
      : DEFAULT_SEARCH_QUERY;

  const limit = parseLimit(req.query.limit);

  const { emails, query, maxResults, allowedSenders } =
    await syncEmailsFromGmail({
      q,
      maxResults: limit,
    });

  const body: ApiSuccessResponse<ParsedEmail[]> = {
    success: true,
    data: emails,
    meta: {
      count: emails.length,
      query,
      limit: maxResults,
      allowedSenders: allowedSenders.map((s) => ({
        label: s.label,
        email: s.email,
      })),
    },
  };

  res.json(body);
}

export async function syncEmails(req: Request, res: Response): Promise<void> {
  const q =
    typeof req.body?.q === "string" && req.body.q.trim() !== ""
      ? req.body.q.trim()
      : DEFAULT_SEARCH_QUERY;

  const limit = parseLimit(req.body?.limit ?? req.query.limit);

  const { emails, query, maxResults, allowedSenders } =
    await syncEmailsFromGmail({
      q,
      maxResults: limit,
    });

  const body: ApiSuccessResponse<ParsedEmail[]> = {
    success: true,
    data: emails,
    meta: {
      count: emails.length,
      query,
      limit: maxResults,
      syncedAt: new Date().toISOString(),
      allowedSenders: allowedSenders.map((s) => ({
        label: s.label,
        email: s.email,
      })),
    },
  };

  res.json(body);
}
