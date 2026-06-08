"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export function SubscribePageClient() {
  const [done, setDone] = useState(false);

  return (
    <section className="mx-auto max-w-narrow px-8 py-12 text-center">
      <Mail size={40} className="mx-auto text-accent-blue" />
      <h1 className="mt-6 font-heading text-4xl font-bold text-ink-primary">
        뉴스레터 구독
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-secondary">
        UPPITY · DAILY_BYTE 핵심 뉴스를 이메일로 받아보세요. 매일 아침 3분
        요약으로 시작하세요.
      </p>

      {done ? (
        <div className="mx-auto mt-10 flex max-w-sm flex-col items-center gap-3 rounded-xl bg-accent-blue-light p-8">
          <CheckCircle2 className="text-accent-blue" size={32} />
          <p className="text-sm font-medium text-ink-primary">
            구독 신청이 완료되었습니다!
          </p>
        </div>
      ) : (
        <form
          className="mx-auto mt-10 max-w-md space-y-4 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">이메일</label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="h-11 w-full rounded-lg border border-border-primary px-4 text-sm outline-none focus:border-accent-blue"
            />
          </div>
          <label className="flex items-start gap-2 text-xs text-ink-secondary">
            <input type="checkbox" required className="mt-0.5" />
            개인정보 수집 및 이용에 동의합니다.
          </label>
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-accent-blue text-sm font-semibold text-white hover:bg-accent-blue-dark"
          >
            구독하기
          </button>
        </form>
      )}
    </section>
  );
}
