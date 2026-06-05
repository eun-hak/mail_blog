/** 무료 tier 15 req/min — 호출 간 최소 4초, 여유를 두고 6.5초 */
const DEFAULT_GEMINI_REQUEST_DELAY_MS = 6500;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getGeminiRequestDelayMs(): number {
  const raw = process.env.GEMINI_REQUEST_DELAY_MS;
  if (raw) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return DEFAULT_GEMINI_REQUEST_DELAY_MS;
}

/** Gemini API 호출 직전 대기 (rate limit 방지) */
export async function geminiThrottle(): Promise<void> {
  await sleep(getGeminiRequestDelayMs());
}

function parseRetryDelayMs(message: string): number {
  const match = message.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) return Math.ceil(Number(match[1]) * 1000) + 500;
  return 25_000;
}

export async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 5
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const is429 =
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.includes("quota");

      if (!is429 || attempt === maxAttempts) throw error;

      const waitMs = parseRetryDelayMs(message);
      console.log(`  ⏳ Rate limit — ${waitMs / 1000}초 후 재시도 (${attempt}/${maxAttempts})`);
      await sleep(waitMs);
    }
  }

  throw lastError;
}
