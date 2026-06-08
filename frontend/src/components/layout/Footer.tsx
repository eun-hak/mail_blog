import Link from "next/link";
import { Facebook, Rss, Twitter, Youtube } from "lucide-react";
import { CATEGORIES } from "../../lib/constants";

export function Footer() {
  return (
    <footer className="bg-surface-dark text-white">
      <div className="mx-auto max-w-content px-8 pb-8 pt-12">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          <div className="max-w-[280px]">
            <p className="font-heading text-[22px] font-bold">NewsBrief</p>
            <p className="mt-3 text-[13px] leading-relaxed text-[#AAAAAA]">
              매일 아침 핵심 뉴스를 3분 요약으로.
            </p>
          </div>

          <div className="flex flex-wrap gap-16">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[2px] text-[#888888]">
                카테고리
              </p>
              <ul className="mt-3 space-y-3">
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/category/${c.slug}`}
                      className="text-[13px] text-[#CCCCCC] hover:text-white"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[2px] text-[#888888]">
                서비스
              </p>
              <ul className="mt-3 space-y-3 text-[13px] text-[#CCCCCC]">
                <li>
                  <Link href="/about" className="hover:text-white">
                    소개
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    문의
                  </Link>
                </li>
                <li>
                  <Link href="/subscribe" className="hover:text-white">
                    뉴스레터 구독
                  </Link>
                </li>
                <li>
                  <a href="/rss" className="hover:text-white">
                    RSS
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[2px] text-[#888888]">
                법적 고지
              </p>
              <ul className="mt-3 space-y-3 text-[13px] text-[#CCCCCC]">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#333344] pt-6 sm:flex-row">
          <p className="text-xs text-[#888888]">
            © 2026 NewsBrief. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[#CCCCCC]">
            <Twitter size={18} />
            <Facebook size={18} />
            <Rss size={18} />
            <Youtube size={18} />
          </div>
        </div>
      </div>
    </footer>
  );
}
