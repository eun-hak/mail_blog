import { Facebook, Link2, Twitter } from "lucide-react";

export function ShareButtons() {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] font-semibold tracking-wide text-ink-tertiary">
        공유하기
      </span>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEE500] text-ink-primary"
        aria-label="카카오"
      >
        <span className="text-xs font-bold">K</span>
      </button>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-primary text-white"
        aria-label="X"
      >
        <Twitter size={16} />
      </button>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue text-white"
        aria-label="Facebook"
      >
        <Facebook size={16} />
      </button>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-secondary"
        aria-label="링크 복사"
      >
        <Link2 size={16} />
      </button>
    </div>
  );
}
