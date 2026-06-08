"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function ContactPageClient() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="mx-auto max-w-narrow px-8 py-12">
      <h1 className="font-heading text-4xl font-bold text-ink-primary">
        문의하기
      </h1>
      <p className="mt-3 text-base leading-relaxed text-ink-secondary">
        뉴스 제보, 오류 제보, 광고 문의, 제휴 문의 등 어떤 내용이든 편하게
        보내주세요.
      </p>

      {submitted ? (
        <p className="mt-10 rounded-lg bg-accent-blue-light p-6 text-sm text-ink-primary">
          문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.
        </p>
      ) : (
        <form
          className="mt-10 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <Field label="문의 유형">
            <select className={inputClass}>
              <option>뉴스 제보</option>
              <option>오류 제보</option>
              <option>광고 문의</option>
              <option>제휴 문의</option>
              <option>기타</option>
            </select>
          </Field>
          <Field label="이름">
            <input className={inputClass} placeholder="이름을 입력하세요" required />
          </Field>
          <Field label="이메일">
            <input
              type="email"
              className={inputClass}
              placeholder="your@email.com"
              required
            />
          </Field>
          <Field label="문의 내용">
            <textarea
              className={`${inputClass} min-h-[160px] resize-y py-3`}
              placeholder="문의 내용을 입력하세요"
              required
            />
          </Field>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 text-sm font-semibold text-white hover:bg-accent-blue-dark"
          >
            <Send size={16} />
            보내기
          </button>
        </form>
      )}
    </section>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-border-primary bg-surface-white px-4 text-sm outline-none focus:border-accent-blue";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink-primary">
        {label}
      </label>
      {children}
    </div>
  );
}
