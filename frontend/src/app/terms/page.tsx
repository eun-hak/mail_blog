const SECTIONS = [
  {
    title: "1. 서비스 목적",
    body: "NewsBrief는 뉴스 요약 및 정보 제공 서비스를 목적으로 합니다.",
  },
  {
    title: "2. 이용자의 의무",
    body: "이용자는 서비스를 법령 및 본 약관에 따라 이용해야 하며, 타인의 권리를 침해해서는 안 됩니다.",
  },
  {
    title: "3. 콘텐츠 저작권",
    body: "NewsBrief에 게시된 콘텐츠의 저작권은 NewsBrief 또는 원저작권자에게 있습니다. 무단 복제 및 배포를 금합니다.",
  },
  {
    title: "4. 면책",
    body: "제공되는 정보는 참고용이며, 투자 등 의사결정에 대한 책임은 이용자에게 있습니다.",
  },
  {
    title: "5. 약관 변경",
    body: "본 약관은 필요 시 변경될 수 있으며, 변경 사항은 사이트에 공지합니다.",
  },
];

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-article px-8 py-12">
      <h1 className="font-heading text-4xl font-bold text-ink-primary">
        이용약관
      </h1>
      <p className="mt-3 text-sm text-ink-tertiary">시행일: 2026.06.05</p>
      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-heading text-xl font-semibold text-ink-primary">
              {s.title}
            </h2>
            <p className="mt-3 text-base leading-[1.7] text-ink-secondary">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
