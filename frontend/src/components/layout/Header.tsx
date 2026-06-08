"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Moon, Search } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border-primary bg-surface-white">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-heading text-2xl font-bold text-ink-primary"
          >
            NewsBrief
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {CATEGORIES.map((cat) => {
              const href = `/category/${cat.slug}`;
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={cat.slug}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-accent-blue"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {cat.label.replace(" 뉴스", "")}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-secondary transition hover:text-ink-primary"
            aria-label="검색"
          >
            <Search size={18} />
          </Link>
          <Link
            href="/subscribe"
            className="flex items-center gap-1.5 rounded-md bg-accent-blue px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-blue-dark"
          >
            <Mail size={14} />
            구독
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-secondary"
            aria-label="다크 모드"
          >
            <Moon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
