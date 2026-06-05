import {
  DEFAULT_MAX_RESULTS,
  DEFAULT_SEARCH_QUERY,
} from "../config/gmail.js";
import { GmailAuthError } from "../services/gmailAuth.service.js";
import { GmailServiceError } from "../services/gmail.service.js";
import { syncEmailsFromGmail } from "../services/emailSync.service.js";

async function main(): Promise<void> {
  const q = process.env.GMAIL_QUERY ?? DEFAULT_SEARCH_QUERY;
  const maxResults = Number(process.env.GMAIL_MAX_RESULTS ?? DEFAULT_MAX_RESULTS);

  try {
    const { emails } = await syncEmailsFromGmail({ q, maxResults });
    console.log(JSON.stringify(emails, null, 2));
  } catch (error) {
    if (error instanceof GmailAuthError) {
      console.error(`[인증 실패 · ${error.step}] ${error.message}`);
      if (error.hint) console.error(`\n${error.hint}`);
      process.exitCode = 1;
      return;
    }

    if (error instanceof GmailServiceError) {
      console.error(`[Gmail API 실패 · ${error.step}] ${error.message}`);
      process.exitCode = 1;
      return;
    }

    console.error(
      `[실행 실패] ${error instanceof Error ? error.message : String(error)}`
    );
    process.exitCode = 1;
  }
}

main();
