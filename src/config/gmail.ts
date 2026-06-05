import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

export const GMAIL_READONLY_SCOPE =
  "https://www.googleapis.com/auth/gmail.readonly";

export const GMAIL_SCOPES = [GMAIL_READONLY_SCOPE];

export const CREDENTIALS_PATH = path.join(projectRoot, "credentials.json");
export const TOKEN_PATH = path.join(projectRoot, "token.json");

import { buildNewsletterSearchQuery } from "./newsletters.js";

export const DEFAULT_SEARCH_QUERY = buildNewsletterSearchQuery();

export const DEFAULT_MAX_RESULTS = 10;
