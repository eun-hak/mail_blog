export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

export const GEMINI_MODEL = "gemini-3.1-flash-lite";

/** LLM에 넣을 메일 본문 최대 길이 (토큰·비용 절감) */
export const GEMINI_EMAIL_BODY_MAX_CHARS = 12_000;

/** 블로그 본문 목표 글자 수 (공백 제외) */
export const BLOG_BODY_MIN_CHARS = 2000;
export const BLOG_BODY_MAX_CHARS = 3000;
