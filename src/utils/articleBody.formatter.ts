/**
 * 소제목 직후 본문이 붙어 있을 때 분리.
 * 제목 안에 자주 나오는 단어(시장, 금융 등)는 제외하고, 문장 시작 패턴만 사용.
 */
const BODY_START =
  / (?=(?:지금까지|하지만|여기서|바로|이제는|이제 |지금 |과거에는|과거 |물론,|결국 |우리는|우리가|많은 |반면,|이런 |이것은|그렇다면|엔비디아의|엔비디아는|미국 기업|미국은|LG의|LG는|LG가|토스의|토스는|토스가|토스증권|금융당국|금융 플랫폼|정부는|정부가|젠슨 황|삼성전자|삼성은|여러분|단순히|그들은|이번 |한편,|특히 |다만,|오늘 |최근 |한국은|일본의|중국의|애플이|구글이|오픈AI|스페이스X|국민연금|페라리의|마이크론|앤트로픽|네이버|카카오|클라우드|반도체|시장의|과거의|이전의|수억 |\d{1,2}만 |\d{1,4}억))/u;

export function splitInlineHeading(line: string): { title: string; body: string } {
  const newlineIdx = line.indexOf("\n");
  if (newlineIdx !== -1) {
    return {
      title: line.slice(0, newlineIdx).trim(),
      body: line.slice(newlineIdx + 1).trim(),
    };
  }

  const qIdx = line.indexOf("? ");
  if (qIdx >= 8 && qIdx <= 72) {
    return {
      title: line.slice(0, qIdx + 1).trim(),
      body: line.slice(qIdx + 2).trim(),
    };
  }

  const parts = line.split(BODY_START);
  if (parts.length >= 2 && parts[0].length >= 8 && parts[0].length <= 80) {
    return { title: parts[0].trim(), body: parts.slice(1).join(" ").trim() };
  }

  return { title: line.trim(), body: "" };
}

/** 소제목 끝에 본문 조각이 잘못 붙은 경우 분리 */
function splitMergedHeadingTail(title: string): { title: string; bodyLead: string } {
  const aiPcTail = title.match(/^(.{12,55})\s+(AI PC[^\n]{4,30}(?:는|은|이|가|를|을|와|과|로|다))$/);
  if (aiPcTail) {
    return { title: aiPcTail[1].trim(), bodyLead: aiPcTail[2].trim() };
  }

  const tailMatch = title.match(
    /^(.{12,52})\s+((?:[가-힣][^\n]{3,24})(?:는|은|이|가|를|을|와|과|로|다))$/
  );
  if (tailMatch) {
    return { title: tailMatch[1].trim(), bodyLead: tailMatch[2].trim() };
  }
  return { title, bodyLead: "" };
}

/** 본문 첫 줄에 소제목이 붙어 있는 경우 ### 로 승격 (LLM 초안 전용) */
function promoteParagraphLeadHeading(text: string): string {
  if (/^### /m.test(text)) return text;

  const blocks = text.split(/\n\n+/);
  const out: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed || trimmed.startsWith("### ")) {
      out.push(trimmed);
      continue;
    }

    const inline = trimmed.match(
      /^([^.?!…?\n]{8,38})\s+(지금 |하지만 |그러나 |반면, |특히 |다만, |한편, |결국 |이제 |오늘 |최근 )([\s\S]*)$/
    );
    if (inline) {
      out.push(`### ${inline[1].trim()}`);
      out.push(`${inline[2]}${inline[3]}`.trim());
      continue;
    }

    out.push(trimmed);
  }

  return out.join("\n\n");
}

export function extractSectionTitles(body: string): string[] {
  return [...body.matchAll(/^### (.+)$/gm)]
    .map((m) => splitInlineHeading(m[1].trim()).title)
    .filter((t) => t.length >= 8 && t.length <= 80);
}

/** 잘못 잘린 '...효과 AI' + 'PC의...' 소제목 복구 */
function repairSplitAiPcHeading(text: string): string {
  return text.replace(
    /(### [^\n]+?) AI\n\n(PC의[^\n]+)/g,
    (_, heading, body) => `${heading}\n\nAI ${body}`
  );
}

/** 소제목 다음 줄이 본문이 아니라 제목 이어쓰기인지 판별 */
export function looksLikeHeadingContinuation(
  heading: string,
  fragment: string
): boolean {
  const h = heading.replace(/^###\s+/, "").trim();
  const f = fragment.trim();
  if (!f || f.startsWith("###")) return false;
  if (f.length > 40) return false;

  // 이미 완결된 질문형 소제목
  if (/[?!…]$/.test(h) && h.length <= 48) return false;
  if (/(?:인가|일까|할까)$/.test(h)) return false;

  // 본문 시작 패턴 (단, 앞 줄이 조사/쉼표로 끊긴 소제목이면 이어쓰기로 처리)
  const headingCutMid =
    /[,·]$/.test(h) ||
    (/(?:은|는|을|를|와|과|에|의|로)$/u.test(h) && !/(?:인가|일까|할까)$/.test(h));
  if (BODY_START.test(` ${f}`) && !headingCutMid) return false;
  if (/^(최근|이번|한편|그러나|하지만|특히|다만|오늘|정부|시장|미국|한국|트럼프|네이버|대통령|이스라엘)/.test(f) && f.length > 12) {
    return false;
  }

  // "…성적표는" + "결국 민생…"처럼 조사/쉼표 뒤 이어짐
  if (/[,·]$/.test(h) || /(?:은|는)$/u.test(h)) {
    return f.length <= 35;
  }

  // "…주거" + "사다리인가"처럼 짧은 꼬리
  if (f.length <= 16 && /(?:인가|일까|할까|인가\?|일까\?)$/.test(f)) return true;

  // 문장 부호 없이 끊긴 긴 소제목 + 짧은 다음 줄
  if (!/[.!?…]$/.test(h) && h.length >= 10 && f.length <= 22) return true;

  return false;
}

/** 잘못 분리된 소제목 줄(### 아래 짧은 한 줄) 복구 */
function repairBrokenHeadings(text: string): string {
  let result = text.trim();
  let changed = true;

  while (changed) {
    changed = false;
    result = result.replace(
      /(### [^\n]+)\n\n([^\n#]+)\n\n/g,
      (match, heading, fragment) => {
        if (!looksLikeHeadingContinuation(String(heading), String(fragment))) {
          return match;
        }
        changed = true;
        return `${heading} ${String(fragment).trim()}\n\n`;
      }
    );
  }

  return result;
}

/** 같은 줄에 붙은 본문만 분리 (BODY_START 분리는 저장 md에서 소제목을 깨뜨림) */
function splitSameLineHeadingBody(line: string): { title: string; body: string } {
  const newlineIdx = line.indexOf("\n");
  if (newlineIdx !== -1) {
    return {
      title: line.slice(0, newlineIdx).trim(),
      body: line.slice(newlineIdx + 1).trim(),
    };
  }

  const qIdx = line.indexOf("? ");
  if (qIdx >= 8 && qIdx <= 72) {
    return {
      title: line.slice(0, qIdx + 1).trim(),
      body: line.slice(qIdx + 2).trim(),
    };
  }

  return { title: line.trim(), body: "" };
}

/** ### 소제목 앞뒤 줄바꿈 정규화 + 제목/본문 분리 */
export function formatArticleBody(text: string): string {
  let formatted = repairBrokenHeadings(text.trim()).replace(
    /\s*###\s+/g,
    "\n\n### "
  );

  formatted = formatted.replace(/###\s+([^\n]+)/g, (_match, line: string) => {
    let { title, body } = splitSameLineHeadingBody(line);
    if (!body) {
      const split = splitMergedHeadingTail(title);
      title = split.title;
      if (split.bodyLead) {
        body = body ? `${split.bodyLead} ${body}` : split.bodyLead;
      }
    }
    if (!body) return `### ${title}`;
    return `### ${title}\n\n${body}`;
  });

  formatted = repairBrokenHeadings(formatted);

  return formatted.replace(/\n{3,}/g, "\n\n").trim();
}

function splitSentences(text: string): string[] {
  const parts = text.split(
    /(?<=[.?!…]["'」]?)\s+(?=[가-힣A-Za-z0-9「"'(])/u
  );
  return parts.map((s) => s.trim()).filter(Boolean);
}

/** 긴 문단을 2~3문장 단위로 나눠 읽기 쉽게 */
function wrapParagraphs(text: string, maxChars = 220): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const charCount = trimmed.replace(/\s/g, "").length;
  if (charCount <= maxChars) return [trimmed];

  const sentences = splitSentences(trimmed);
  if (sentences.length <= 2) return [trimmed];

  const paragraphs: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    const nextChars = next.replace(/\s/g, "").length;
    const sentenceCount = (next.match(/[.?!…]/g) ?? []).length;

    if (current && (nextChars > maxChars || sentenceCount >= 3)) {
      paragraphs.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current) paragraphs.push(current.trim());
  return paragraphs.length > 0 ? paragraphs : [trimmed];
}

/** 잘못 나뉜 문단을 합친 뒤 다시 레이아웃 */
function unwrapForRelayout(text: string): string {
  const blocks = text.split(/\n\n+/);
  const out: string[] = [];
  let buffer = "";

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      if (buffer) {
        out.push(buffer.trim());
        buffer = "";
      }
      out.push(trimmed);
    } else {
      buffer = buffer ? `${buffer} ${trimmed}` : trimmed;
    }
  }

  if (buffer) out.push(buffer.trim());
  return out.join("\n\n");
}

/** 소제목 정리 + 문단 나누기 (md 저장·API용) */
export type LayoutArticleBodyOptions = {
  /** LLM 초안 최초 저장 시 true. 저장된 md 재처리 시 false(unwrap·승격 금지) */
  relayout?: boolean;
};

export function layoutArticleBody(
  text: string,
  options: LayoutArticleBodyOptions = {}
): string {
  const relayout = options.relayout ?? false;
  const prepped = relayout
    ? promoteParagraphLeadHeading(
        repairSplitAiPcHeading(unwrapForRelayout(text))
      )
    : repairSplitAiPcHeading(text.trim());
  const formatted = formatArticleBody(prepped);
  const blocks = formatted.split(/\n\n+/);
  const out: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      out.push(trimmed);
      continue;
    }

    out.push(...wrapParagraphs(trimmed));
  }

  return out.join("\n\n").trim();
}
