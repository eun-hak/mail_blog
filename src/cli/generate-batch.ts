import "dotenv/config";
import { buildNewsletterSearchQuery } from "../config/newsletters.js";
import { generateBatchArticles } from "../services/batchGeneration.service.js";

function todayQuery(): string {
  return buildNewsletterSearchQuery(1);
}

async function main(): Promise<void> {
  const resume = process.argv.includes("--resume");
  const todayOnly = process.argv.includes("--today");
  const nums = process.argv.filter((a) => /^\d+$/.test(a));
  const targetCount = Number(nums[0] ?? 20);
  const emailLimit = Number(nums[1] ?? 12);
  const query = todayOnly ? todayQuery() : process.env.GMAIL_QUERY;

  console.log(
    `\n📬 ${resume ? "이어서" : todayOnly ? "오늘 메일 →" : "지난 메일 분석 →"} 블로그 ${targetCount}편 생성 시작\n`
  );
  if (query) console.log(`  Gmail: ${query}\n`);

  const result = await generateBatchArticles({
    targetCount,
    emailLimit,
    resume,
    query,
    newerThanDays: todayOnly ? 1 : undefined,
  });

  console.log("\n=== 완료 ===");
  console.log(`메일: ${result.emailsFetched}통`);
  console.log(`주제: ${result.topicsExtracted}개 추출`);
  console.log(`글: ${result.articlesWritten}편 저장 → ${result.outputDir}`);
  if (result.errors.length > 0) {
    console.log(`오류: ${result.errors.length}건`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
