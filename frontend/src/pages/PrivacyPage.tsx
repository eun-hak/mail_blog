const SECTIONS = [
  {
    title: "1. 수집하는 개인정보",
    body: "NewsBrief는 뉴스레터 구독 및 문의 서비스 제공을 위해 이메일 주소, 이름 등 최소한의 개인정보를 수집할 수 있습니다.",
  },
  {
    title: "2. 개인정보의 이용 목적",
    body: "수집된 정보는 뉴스레터 발송, 문의 응대, 서비스 개선 목적으로만 이용됩니다.",
  },
  {
    title: "3. 보유 및 이용 기간",
    body: "구독 해지 또는 문의 처리 완료 후 지체 없이 파기합니다. 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.",
  },
  {
    title: "4. 제3자 제공",
    body: "NewsBrief는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.",
  },
  {
    title: "5. 문의",
    body: "개인정보 관련 문의는 문의 페이지를 통해 연락해 주세요.",
  },
];

export function PrivacyPage() {
  return (
    <section className="mx-auto max-w-article px-8 py-12">
      <h1 className="font-heading text-4xl font-bold text-ink-primary">
        개인정보처리방침
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
