import "dotenv/config";
import { generateBatchArticles } from "../services/batchGeneration.service.js";

async function main(): Promise<void> {
  const resume = process.argv.includes("--resume");
  const nums = process.argv.filter((a) => /^\d+$/.test(a));
  const targetCount = Number(nums[0] ?? 20);
  const emailLimit = Number(nums[1] ?? 12);

  console.log(
    `\n📬 ${resume ? "이어서" : "지난 메일 분석 →"} 블로그 ${targetCount}편 생성 시작\n`
  );

  const result = await generateBatchArticles({
    targetCount,
    emailLimit,
    resume,
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
