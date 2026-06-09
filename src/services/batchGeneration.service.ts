import fs from "node:fs";
import path from "node:path";
import { buildNewsletterSearchQuery } from "../config/newsletters.js";
import { analyzeTopicToBlog } from "./gemini.service.js";
import { syncEmailsFromGmail } from "./emailSync.service.js";
import { extractTopicsFromEmail } from "./topicExtraction.service.js";
import type { GeneratedArticle } from "../types/article.types.js";
import type { TopicArticleJob } from "../types/topic.types.js";
import { toGeneratedArticle } from "../utils/articleMapper.js";
import {
  slugify,
  writeArticleMarkdown,
} from "../utils/articleMarkdown.writer.js";
import { resolveArticleImageUrl } from "./articleImage.service.js";

export type BatchGenerationOptions = {
  targetCount?: number;
  emailLimit?: number;
  outputDir?: string;
  newerThanDays?: number;
  /** true면 generated/pending-jobs.json 에서 이어서 생성 */
  resume?: boolean;
};

export type BatchGenerationResult = {
  emailsFetched: number;
  topicsExtracted: number;
  articlesWritten: number;
  outputDir: string;
  files: string[];
  errors: { step: string; message: string }[];
};

function pickJobs(
  jobs: TopicArticleJob[],
  targetCount: number
): TopicArticleJob[] {
  const sorted = [...jobs].sort(
    (a, b) => b.topic.priority - a.topic.priority
  );

  const picked: TopicArticleJob[] = [];
  const perEmail = new Map<string, number>();

  for (const job of sorted) {
    if (picked.length >= targetCount) break;
    const count = perEmail.get(job.email.gmailMessageId) ?? 0;
    if (count >= 4) continue;
    picked.push(job);
    perEmail.set(job.email.gmailMessageId, count + 1);
  }

  return picked;
}

export function getGeneratedArticlesDir(): string {
  return path.join(process.cwd(), "generated", "articles");
}

export async function generateBatchArticles(
  options: BatchGenerationOptions = {}
): Promise<BatchGenerationResult> {
  const targetCount = options.targetCount ?? 20;
  const emailLimit = options.emailLimit ?? 14;
  const outputDir = options.outputDir ?? getGeneratedArticlesDir();
  const newerThanDays = options.newerThanDays ?? 30;

  const errors: BatchGenerationResult["errors"] = [];
  const pendingPath = path.join(path.dirname(outputDir), "pending-jobs.json");

  let emailsFetched = 0;
  let allJobs: TopicArticleJob[] = [];

  if (options.resume && fs.existsSync(pendingPath)) {
    const saved = JSON.parse(
      fs.readFileSync(pendingPath, "utf-8")
    ) as { jobs: TopicArticleJob[]; emailsFetched: number };
    allJobs = saved.jobs;
    emailsFetched = saved.emailsFetched;
    console.log(`  이어하기: 저장된 주제 ${allJobs.length}개 로드\n`);
  } else {
    const query = buildNewsletterSearchQuery(newerThanDays);
    const { emails } = await syncEmailsFromGmail({
      q: query,
      maxResults: emailLimit,
    });
    emailsFetched = emails.length;

    for (const email of emails) {
      try {
        const extraction = await extractTopicsFromEmail(email);
        extraction.topics.forEach((topic, topicIndex) => {
          allJobs.push({ email, topic, topicIndex });
        });
        console.log(
          `  주제 추출: ${email.subject?.slice(0, 40)} → ${extraction.topics.length}개`
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        errors.push({
          step: "extract",
          message: `${email.gmailMessageId}: ${message}`,
        });
        console.error(`  주제 추출 실패: ${message}`);
      }
    }

    fs.writeFileSync(
      pendingPath,
      JSON.stringify({ jobs: allJobs, emailsFetched }, null, 2),
      "utf-8"
    );
  }

  const jobs = pickJobs(allJobs, targetCount);
  console.log(`\n총 ${allJobs.length}개 주제 중 ${jobs.length}개 글 생성 예정\n`);

  fs.mkdirSync(outputDir, { recursive: true });
  const files: string[] = [];
  let articleIndex = 0;

  function jobFilename(job: TopicArticleJob, order: number): string {
    const sourceTag = job.email.from?.toUpperCase().includes("DAILY_BYTE")
      ? "daily-byte"
      : "uppity";
    const prefix = String(order).padStart(3, "0");
    return `${prefix}-${sourceTag}-${slugify(job.topic.title)}.md`;
  }

  const usedImageUrls = new Set<string>();

  for (const job of jobs) {
    articleIndex += 1;
    const filename = jobFilename(job, articleIndex);
    const filePath = path.join(outputDir, filename);

    if (fs.existsSync(filePath)) {
      console.log(`[${articleIndex}/${jobs.length}] 건너뜀 (이미 존재): ${filename}`);
      files.push(filePath);
      continue;
    }

    try {
      console.log(`[${articleIndex}/${jobs.length}] 생성 중: ${job.topic.title}`);
      const analysis = await analyzeTopicToBlog(
        job.email,
        job.topic,
        articleIndex
      );

      const articleId = `${job.email.gmailMessageId}-t${job.topicIndex}`;
      const generated = toGeneratedArticle(job.email, analysis, { id: articleId });
      const imageUrl = await resolveArticleImageUrl({
        articleId,
        title: generated.title,
        description: generated.description,
        categorySlug: generated.categorySlug,
        imageSearchQuery: analysis.imageSearchQuery,
        usedUrls: usedImageUrls,
      });
      const article: GeneratedArticle = {
        ...generated,
        id: articleId,
        gmailMessageId: job.email.gmailMessageId,
        imageUrl,
        imageSearchQuery: analysis.imageSearchQuery,
      };

      writeArticleMarkdown(filePath, article, {
        email: job.email,
        topic: job.topic,
      });
      files.push(filePath);
      console.log(`  ✓ 저장: ${filename}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ step: "generate", message: `${job.topic.title}: ${message}` });
      console.error(`  ✗ 실패: ${message}`);
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    targetCount,
    emailsFetched,
    topicsExtracted: allJobs.length,
    articlesWritten: files.length,
    files: files.map((f) => path.relative(process.cwd(), f)),
    errors,
  };
  fs.writeFileSync(
    path.join(path.dirname(outputDir), "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );

  return {
    emailsFetched,
    topicsExtracted: allJobs.length,
    articlesWritten: files.length,
    outputDir,
    files,
    errors,
  };
}
