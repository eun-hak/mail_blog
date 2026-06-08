"use client";

import { ChevronDown } from "lucide-react";

type Props = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function FilterButton({ label, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium ${
        active
          ? "bg-accent-blue text-white"
          : "border border-border-primary bg-surface-white text-ink-secondary"
      }`}
    >
      {label}
      <ChevronDown size={14} />
    </button>
  );
}
