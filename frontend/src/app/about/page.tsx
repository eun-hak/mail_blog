import Link from "next/link";
import { Mail } from "lucide-react";

const SECTIONS = [
  {
    title: "운영 목적",
    body: "NewsBrief는 실시간 뉴스와 주요 이슈를 빠르게 요약해서 전하는 뉴스레터형 블로그입니다. 일상에서 바쁜 독자들이 3분 이내로 핵심 뉴스를 파악할 수 있도록 도와드립니다.",
  },
  {
    title: "다루는 주제",
    body: "AI 및 인공지능, 테크 산업 동향, 경제 이슈, 정부 정책, 사회 이슈 등 다양한 분야의 뉴스를 다룹니다. 특히 AI와 테크 산업에 대한 심층 분석을 제공합니다.",
  },
  {
    title: "뉴스 선정 기준",
    body: "신뢰할 수 있는 언론사, 공식 발표 자료, 연구 기관의 보고서 등을 기반으로 뉴스를 선정합니다. 모든 글에는 출처를 명시하여 투명하게 운영합니다.",
  },
  {
    title: "AI 활용 여부",
    body: "뉴스 수집과 요약 과정에서 AI 도구를 활용할 수 있습니다. 다만 모든 콘텐츠는 사람이 검토하고 확인한 후 발행됩니다. AI 활용 여부는 각 글에 투명하게 표시됩니다.",
  },
  {
    title: "정정 및 문의 안내",
    body: "기사 내용에 오류가 있거나 정정이 필요한 경우, 문의 페이지를 통해 알려주세요. 빠르게 확인하고 수정하겠습니다.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-article px-8 py-12">
      <h1 className="font-heading text-4xl font-bold text-ink-primary">
        NewsBrief 소개
      </h1>
      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-heading text-[22px] font-semibold text-ink-primary">
              {s.title}
            </h2>
            <p className="mt-3 text-base leading-[1.7] text-ink-secondary">
              {s.body}
            </p>
          </div>
        ))}
      </div>
      <Link
        href="/contact"
        className="mt-10 inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 text-[15px] font-semibold text-white hover:bg-accent-blue-dark"
      >
        <Mail size={18} />
        문의하기
      </Link>
    </section>
  );
}
