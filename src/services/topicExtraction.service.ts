import { GoogleGenAI, Type } from "@google/genai";
import {
  GEMINI_API_KEY,
  GEMINI_EMAIL_BODY_MAX_CHARS,
  GEMINI_MODEL,
} from "../config/gemini.js";
import { geminiThrottle, withGeminiRetry } from "../utils/geminiRetry.js";
import { GeminiServiceError } from "./gemini.service.js";
import type { ExtractedTopic, TopicExtractionResult } from "../types/topic.types.js";
import type { ParsedEmail } from "../types/email.types.js";

const TOPICS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          angle: { type: Type.STRING },
          categorySlug: {
            type: Type.STRING,
            enum: ["ai", "tech", "economy", "policy", "issue"],
          },
          priority: { type: Type.NUMBER },
        },
        required: ["title", "angle", "categorySlug", "priority"],
      },
    },
  },
  required: ["topics"],
};

function truncateBody(text: string | null, html: string | null): string {
  const raw = text?.trim() || "";
  if (raw) return raw.slice(0, GEMINI_EMAIL_BODY_MAX_CHARS);
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, GEMINI_EMAIL_BODY_MAX_CHARS);
}

function buildExtractionPrompt(email: ParsedEmail, body: string): string {
  const source = email.from?.toUpperCase().includes("DAILY_BYTE")
    ? "DAILY_BYTE"
    : "UPPITY";

  return `다음 뉴스레터에서 **블로그 글로 쓸 만한 독립 주제**를 추출하세요.

## 메타
- 발신: ${source}
- 제목: ${email.subject ?? "(없음)"}
- 날짜: ${email.date ?? ""}

## 원문
${body}

## 규칙
- 주제 **2~4개**만 추출 (품질 낮은 것은 과감히 제외)
- 머니퀴즈, 퀴즈 당첨, 구독 안내, 광고 문구, 이벤트는 제외
- 각 주제는 **서로 다른 이슈**여야 함 (중복 금지)
- title: 블로그 글 제목 후보 (25자 내외)
- angle: 이 주제만 깊게 쓸 때의 관점·핵심 질문 (1~2문장)
- categorySlug: ai | tech | economy | policy | issue
- priority: 1(낮음)~5(높음) — 독자 관심·시의성 기준

${source === "UPPITY" ? "UPPITY는 증시·정책·기업·재테크 중 서로 다른 섹션을 골라 주세요." : "DAILY_BYTE는 이슈한입·뉴스한입·주식한입 단위로 나누세요."}`;
}

export async function extractTopicsFromEmail(
  email: ParsedEmail
): Promise<TopicExtractionResult> {
  const body = truncateBody(email.text, email.html);
  if (!body) {
    return {
      gmailMessageId: email.gmailMessageId,
      emailSubject: email.subject,
      topics: [],
    };
  }

  if (!GEMINI_API_KEY) {
    throw new GeminiServiceError(
      "GEMINI_API_KEY가 설정되지 않았습니다.",
      "config"
    );
  }

  await geminiThrottle();

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const response = await withGeminiRetry(() =>
    ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildExtractionPrompt(email, body),
    config: {
      systemInstruction:
        "뉴스레터에서 블로그 주제만 JSON으로 추출합니다. 사실을 지어내지 마세요.",
      responseMimeType: "application/json",
      responseJsonSchema: TOPICS_SCHEMA,
      temperature: 0.3,
    },
    })
  );

  const raw = response.text?.trim();
  if (!raw) {
    throw new GeminiServiceError("주제 추출 응답이 비어 있습니다.", "empty_response");
  }

  const parsed = JSON.parse(raw) as { topics: ExtractedTopic[] };
  const topics = (parsed.topics ?? [])
    .slice(0, 4)
    .map((t) => ({
      ...t,
      priority: Math.min(5, Math.max(1, Math.round(t.priority))),
    }));

  return {
    gmailMessageId: email.gmailMessageId,
    emailSubject: email.subject,
    topics,
  };
}
