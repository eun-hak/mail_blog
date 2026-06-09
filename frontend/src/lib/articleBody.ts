export type ArticleBlock =
  | { type: "subtitle"; content: string }
  | { type: "paragraph"; content: string };

const BODY_START =
  / (?=(?:지금까지|하지만|여기서|바로|이제는|이제 |지금 |과거에는|과거 |물론,|결국 |우리는|우리가|많은 |반면,|이런 |이것은|그렇다면|엔비디아의|엔비디아는|미국 기업|미국은|LG의|LG는|LG가|토스의|토스는|토스가|토스증권|금융당국|금융 플랫폼|정부는|정부가|젠슨 황|삼성전자|삼성은|여러분|단순히|그들은|이번 |한편,|특히 |다만,|오늘 |최근 |한국은|일본의|중국의|애플이|구글이|오픈AI|스페이스X|국민연금|페라리의|마이크론|앤트로픽|네이버|카카오|클라우드|반도체|시장의|과거의|이전의|수억 |\d{1,2}만 |\d{1,4}억))/u;

function splitInlineHeading(line: string): { title: string; body: string } {
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

function promoteParagraphLeadHeading(text: string): string {
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

function repairSplitAiPcHeading(text: string): string {
  return text.replace(
    /(### [^\n]+?) AI\n\n(PC의[^\n]+)/g,
    (_, heading, body) => `${heading}\n\nAI ${body}`
  );
}

function repairBrokenHeadings(text: string): string {
  return text.replace(
    /(### [^\n]+)\n\n([^\n#.\n]{2,20})\n\n/g,
    (_, heading, fragment) => {
      if (/[?!.:]$/.test(String(heading).trim())) {
        return `${heading}\n\n${fragment}\n\n`;
      }
      if (String(fragment).includes(" ") && String(fragment).length > 10) {
        return `${heading}\n\n${fragment}\n\n`;
      }
      if (String(heading).trim().length + String(fragment).length > 52) {
        return `${heading}\n\n${fragment}\n\n`;
      }
      return `${heading} ${fragment}\n\n`;
    }
  );
}

function formatArticleBody(text: string): string {
  let formatted = repairBrokenHeadings(text.trim()).replace(
    /\s*###\s+/g,
    "\n\n### "
  );

  formatted = formatted.replace(/###\s+([^\n]+)/g, (_match, line: string) => {
    let { title, body } = splitInlineHeading(line);
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

  return formatted.replace(/\n{3,}/g, "\n\n").trim();
}

function splitSentences(text: string): string[] {
  const parts = text.split(
    /(?<=[.?!…]["'」]?)\s+(?=[가-힣A-Za-z0-9「"'(])/u
  );
  return parts.map((s) => s.trim()).filter(Boolean);
}

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

function layoutArticleBody(text: string): string {
  const formatted = formatArticleBody(
    promoteParagraphLeadHeading(
      repairSplitAiPcHeading(unwrapForRelayout(text))
    )
  );
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

export function parseArticleBlocks(text: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];

  for (const part of text.split(/\n\n+/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      const { title, body } = splitInlineHeading(trimmed.slice(4).trim());
      if (title) blocks.push({ type: "subtitle", content: title });
      if (body) {
        for (const para of wrapParagraphs(body)) {
          blocks.push({ type: "paragraph", content: para });
        }
      }
      continue;
    }

    blocks.push({ type: "paragraph", content: trimmed });
  }

  return blocks;
}
