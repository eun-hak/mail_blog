"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

export function Pagination({ page = 1, totalPages = 3, onPageChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-secondary disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange?.(p)}
          className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium ${
            p === page
              ? "bg-accent-blue text-white"
              : "bg-surface-muted text-ink-secondary hover:text-ink-primary"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-secondary disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
