"use client";

import { Mail } from "lucide-react";
import Link from "next/link";

export function NewsletterBox() {
  return (
    <section className="mx-auto max-w-content rounded-xl bg-accent-blue px-8 py-12 text-center md:px-16">
      <Mail size={32} className="mx-auto text-white" />
      <h2 className="mt-6 font-heading text-2xl font-semibold text-white md:text-[28px]">
        매일 아침 핵심 뉴스를 3분 요약으로 받아보세요.
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/80">
        주요 뉴스와 트렌드를 이메일로 간편하게 받아보세요. 언제든 구독 취소
        가능합니다.
      </p>
      <form
        className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row sm:justify-center"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          placeholder="your@email.com"
          className="h-11 flex-1 rounded-lg border-0 px-4 text-sm text-ink-primary outline-none"
        />
        <Link
          href="/subscribe"
          className="flex h-11 items-center justify-center rounded-lg bg-[#0D47A1] px-6 text-sm font-semibold text-white hover:bg-[#0a3a85]"
        >
          구독하기
        </Link>
      </form>
    </section>
  );
}
