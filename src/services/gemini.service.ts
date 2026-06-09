import { GoogleGenAI, Type } from "@google/genai";
import {
  BLOG_BODY_MAX_CHARS,
  BLOG_BODY_MIN_CHARS,
  GEMINI_API_KEY,
  GEMINI_EMAIL_BODY_MAX_CHARS,
  GEMINI_MODEL,
} from "../config/gemini.js";
import type { GeminiBlogAnalysis } from "../types/article.types.js";
import type { ParsedEmail } from "../types/email.types.js";
import type { ExtractedTopic } from "../types/topic.types.js";
import { layoutArticleBody } from "../utils/articleBody.formatter.js";
import { geminiThrottle, withGeminiRetry } from "../utils/geminiRetry.js";

export class GeminiServiceError extends Error {
  constructor(
    message: string,
    public readonly step?: string
  ) {
    super(message);
    this.name = "GeminiServiceError";
  }
}

function truncateBody(text: string | null, html: string | null): string {
  const raw = (text?.trim() || stripHtml(html ?? "") || "").slice(
    0,
    GEMINI_EMAIL_BODY_MAX_CHARS
  );
  return raw;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectSourceHint(from: string | null): string {
  if (!from?.toUpperCase().includes("DAILY_BYTE")) {
    return "UPPITY — 경제·시장·재테크 독자";
  }
  return "DAILY_BYTE — 이슈·테크·정책 독자";
}

const UPPITY_STYLES = [
  "담담한 관찰자 시점 — 시장 소음 속에서 구조와 패턴을 읽는 해설",
  "역사·비유로 풀어내는 설명 — 과거 사례와 오늘을 대비",
  "이슈 뒤 숨은 구조를 파헤치는 분석 — 겉 뉴스 너머의 메커니즘",
  "독자에게 말 거는 대화체 — 포트폴리오와 일상에서의 체감",
];

const DAILY_BYTE_STYLES = [
  "질문으로 시작하는 칼럼 — 독자의 일상 경험에서 출발해 거시 이슈로 확장",
  "현장감 있는 해설 — 장 마감·뉴스 속보 직후의 분위기",
  "이슈 뒤 숨은 구조를 파헤치는 분석 — 정책·시장 연결고리",
  "담담한 관찰자 시점 — 숫자 뒤의 의미를 차분히 짚기",
];

/** 발신자별로 서로 다른 어투를 강제해 템플릿 겹침 방지 */
function assignWritingStyle(from: string | null, variant = 0): string {
  if (from?.toUpperCase().includes("DAILY_BYTE")) {
    return DAILY_BYTE_STYLES[variant % DAILY_BYTE_STYLES.length];
  }
  return UPPITY_STYLES[variant % UPPITY_STYLES.length];
}

function countBodyChars(text: string): number {
  return text.replace(/\s/g, "").length;
}

function buildPrompt(
  email: ParsedEmail,
  body: string,
  options: { assignedStyle: string; lengthNote?: string; topic?: ExtractedTopic }
): string {
  const sender = email.from ?? "알 수 없음";
  const subject = email.subject ?? "(제목 없음)";
  const date = email.date ?? "";
  const sourceHint = detectSourceHint(email.from);
  const lengthNote = options.lengthNote ?? "";
  const topicBlock = options.topic
    ? `
## 이번 글 집중 주제 (이것만 깊게)
- 주제: ${options.topic.title}
- 관점: ${options.topic.angle}
- 다른 섹션은 최소한만 언급하고, 위 주제 하나에 집중하세요.
`
    : "";

  return `아래 뉴스레터는 **소재·팩트 참고용**입니다. 뉴스레터를 요약·재배열하지 말고, **완전히 새로운 독립 블로그 글**을 써 주세요.

## 참고 소재 (그대로 베끼지 말 것)
- 발신: ${sender}
- 제목: ${subject}
- 날짜: ${date}
- 성격: ${sourceHint}
- **이번 글 필수 스타일**: ${options.assignedStyle}
  (writingStyle 필드에 위 문구를 그대로 넣고, 도입·전개·마무리 전체에 일관 적용)

${topicBlock}
## 원문
${body}
${lengthNote}

## 글쓰기 원칙

### 1. 독창성
- 뉴스레터 문장·순서·소제목 구조를 따르지 마세요.
- 같은 팩트라도 **다른 비유, 다른 시각, 다른 도입부**로 씁니다.
- 독자가 "뉴스레터를 읽은 느낌"이 아니라 "블로그 칼럼을 읽은 느낌"이어야 합니다.

### 2. 분량 (가장 중요)
- body는 **공백 제외 반드시 ${BLOG_BODY_MIN_CHARS}~${BLOG_BODY_MAX_CHARS}자**.
- ${BLOG_BODY_MIN_CHARS}자 미만이면 실패입니다. 짧은 요약문이 아니라 **칼럼 전체 호흡**으로 씁니다.
- 문단 6~10개, 문단마다 길이와 리듬을 다르게. 중간에 독자에게 던지는 질문·비유·구체적 장면을 넣어 분량을 채웁니다.

### 3. 어투 (존댓말 필수)
- **전체 본문을 '~합니다 / ~입니다 / ~하세요' 체(존댓말)로** 작성합니다.
- 반말, 해요체 혼용, 뉴스 속보체(~했다, ~이다) 금지.
- 독자에게 말 걸 때도 "여러분", "~하시는 분" 등 존중하는 표현을 사용합니다.

### 4. 본문 소제목 (흐름에 맞게)
- body 안에 **3~5개의 소제목**을 넣습니다. 형식은 반드시 \`### 소제목\\n\\n본문...\` (소제목 뒤 빈 줄 필수, 본문과 같은 줄에 쓰지 마세요)
- 소제목은 **그 순간 전개되는 논지를 요약**해야 합니다. 예: "배경", "전망", "핵심 요약" 같은 템플릿 라벨 금지.
- \`**굵게**\`, HTML 태그, 밑줄 등 추가 마크업 금지. 소제목은 \`###\`만 사용합니다.
- 글마다 소제목 문구·개수·위치를 다르게. 소제목 없이 이어지는 구간도 1~2문단 허용.
- 소제목 아래 문단은 2~4개, 소제목마다 분량과 톤이 달라도 됩니다.

### 5. 어투·구조 (템플릿 금지)
- 위에 지정된 **필수 스타일**만 사용. 다른 글과 같은 도입·마무리 패턴을 쓰지 마세요.

**절대 금지:**
- 매번 "최근 국내 증시는~" / "이번 환율 급등의 배경에는~" 같은 뻔한 도입
- 매번 "향후 전망은~" / "시장의 불확실성은 여전하지만~" 같은 뻔한 마무리
- "배경", "시사점", "마무리", "핵심 정리" 등 **뻔한 고정 소제목**
- 4문단·5문단 고정, bullet 나열 후 본문 요약 같은 반복 골격
- highlights와 body가 같은 문장을 반복

### 6. 메타 필드
- title: 뉴스레터 제목과 **다른** 블로그용 제목. 과장·낚시는 금지.
- description: 1~2문장, 120자 내외. 이 글만의 톤이 느껴지게.
- categorySlug: ai | tech | economy | policy | issue 중 하나.
- highlights: 3~5개. 문장 형태·길이·말투를 서로 다르게.
- marketInfo: 코스피·코스닥·원달러 숫자만. 없으면 null.
- writingStyle: 위 '필수 스타일' 문구를 그대로 기입
- imageSearchQuery: 썸네일용 Unsplash 검색 키워드. **영어 2~4단어**. 글 주제의 핵심 사물·장면 (예: "nvidia ai chip", "korean stock market", "electric ferrari car"). 추상어·브랜드 슬로건보다 눈에 보이는 장면 위주.`;
}

async function generateBlogDraft(
  ai: GoogleGenAI,
  email: ParsedEmail,
  sourceBody: string,
  assignedStyle: string,
  lengthNote?: string,
  topic?: ExtractedTopic
): Promise<GeminiBlogAnalysis> {
  await geminiThrottle();

  const response = await withGeminiRetry(() =>
    ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(email, sourceBody, { assignedStyle, lengthNote, topic }),
    config: {
        systemInstruction: `당신은 독립 경제·테크 블로그의 칼럼니스트입니다.
뉴스레터는 소재일 뿐이며, 글의 문체·구조·도입·마무리는 매번 새롭게 만듭니다.
사실 관계는 지키되, 뉴스 요약문이 아닌 독자가 끝까지 읽고 싶은 오리지널 칼럼을 씁니다.
본문은 존댓말(합니다체)로 작성하고, 흐름에 맞는 ### 소제목으로 단락을 나눕니다.
본문 body는 공백 제외 최소 ${BLOG_BODY_MIN_CHARS}자, 최대 ${BLOG_BODY_MAX_CHARS}자입니다. 이보다 짧으면 안 됩니다.`,
      responseMimeType: "application/json",
      responseJsonSchema: BLOG_SCHEMA,
      temperature: 0.85,
      maxOutputTokens: 8192,
    },
    })
  );

  const raw = response.text?.trim();
  if (!raw) {
    throw new GeminiServiceError("Gemini 응답이 비어 있습니다.", "empty_response");
  }

  const parsed = JSON.parse(raw) as GeminiBlogAnalysis;
  return {
    ...parsed,
    writingStyle: parsed.writingStyle || assignedStyle,
    marketInfo: {
      kospi: parsed.marketInfo?.kospi ?? null,
      kosdaq: parsed.marketInfo?.kosdaq ?? null,
      usdKrw: parsed.marketInfo?.usdKrw ?? null,
    },
  };
}

const BLOG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    category: { type: Type.STRING },
    categorySlug: {
      type: Type.STRING,
      enum: ["ai", "tech", "economy", "policy", "issue"],
    },
    writingStyle: {
      type: Type.STRING,
      description: "이 글에 적용한 서술 스타일 한 줄 설명",
    },
    body: { type: Type.STRING },
    highlights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    marketInfo: {
      type: Type.OBJECT,
      properties: {
        kospi: { type: Type.STRING, nullable: true },
        kosdaq: { type: Type.STRING, nullable: true },
        usdKrw: { type: Type.STRING, nullable: true },
      },
      required: ["kospi", "kosdaq", "usdKrw"],
    },
    imageSearchQuery: {
      type: Type.STRING,
      description:
        "English 2-4 word Unsplash search query for article thumbnail",
    },
  },
  required: [
    "title",
    "description",
    "category",
    "categorySlug",
    "writingStyle",
    "body",
    "highlights",
    "marketInfo",
    "imageSearchQuery",
  ],
};

function getClient(): GoogleGenAI {
  if (!GEMINI_API_KEY) {
    throw new GeminiServiceError(
      "GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해 주세요.",
      "config"
    );
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

async function generateBlogFromEmail(
  email: ParsedEmail,
  options: { assignedStyle: string; topic?: ExtractedTopic }
): Promise<GeminiBlogAnalysis> {
  const body = truncateBody(email.text, email.html);
  if (!body) {
    throw new GeminiServiceError(
      "이메일 본문이 비어 있어 분석할 수 없습니다.",
      "empty_body"
    );
  }

  const ai = getClient();

  try {
    let draft = await generateBlogDraft(
      ai,
      email,
      body,
      options.assignedStyle,
      undefined,
      options.topic
    );
    let charCount = countBodyChars(draft.body);

    for (let attempt = 0; attempt < 2 && charCount < BLOG_BODY_MIN_CHARS; attempt++) {
      const lengthNote = `
## ⚠️ 분량 보정 (필수) — 재시도 ${attempt + 2}회차
이전 body는 공백 제외 ${charCount}자입니다. **최소 ${BLOG_BODY_MIN_CHARS}자, 권장 2400자 전후**로 다시 작성하세요.
- 필수 스타일(${options.assignedStyle}) 유지.`;
      draft = await generateBlogDraft(
        ai,
        email,
        body,
        options.assignedStyle,
        lengthNote,
        options.topic
      );
      charCount = countBodyChars(draft.body);
    }

    return {
      ...draft,
      body: layoutArticleBody(draft.body),
    };
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error;
    const message =
      error instanceof Error ? error.message : "Gemini 분석 중 오류";
    throw new GeminiServiceError(message, "generate");
  }
}

export async function analyzeTopicToBlog(
  email: ParsedEmail,
  topic: ExtractedTopic,
  styleVariant = 0
): Promise<GeminiBlogAnalysis> {
  return generateBlogFromEmail(email, {
    assignedStyle: assignWritingStyle(email.from, styleVariant),
    topic,
  });
}

export async function analyzeEmailToBlog(
  email: ParsedEmail
): Promise<GeminiBlogAnalysis> {
  const body = truncateBody(email.text, email.html);
  if (!body) {
    throw new GeminiServiceError(
      "이메일 본문이 비어 있어 분석할 수 없습니다.",
      "empty_body"
    );
  }

  return generateBlogFromEmail(email, {
    assignedStyle: assignWritingStyle(email.from),
  });
}
