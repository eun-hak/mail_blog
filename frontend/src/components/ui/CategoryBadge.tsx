type Props = { label: string };

export function CategoryBadge({ label }: Props) {
  return (
    <span className="inline-flex rounded px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent-blue bg-accent-blue-light">
      {label}
    </span>
  );
}
