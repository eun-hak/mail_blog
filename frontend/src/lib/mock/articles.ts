import type { Article } from "../types";
import { PLACEHOLDER_IMAGES } from "../constants";

/** Supabase + LLM 파이프라인 연동 전 프론트 개발용 목업 */
export const MOCK_ARTICLES: Article[] = [
  {
    id: "mock-001",
    title: "국내 대형 AI 플랫폼 출시, 업계 판도 바꾸나",
    description:
      "국내 대형 IT 기업들이 자체 AI 플랫폼을 연이어 출시하며 시장 주도권 잡기에 나섰다. 글로벌 경쟁이 치열해지는 가운데 국내 기업들의 전략이 주목받고 있다.",
    category: "AI 뉴스",
    categorySlug: "ai",
    source: "DAILY_BYTE",
    date: "2026.06.05",
    relativeTime: "30분 전",
    readMinutes: 5,
    imageUrl: PLACEHOLDER_IMAGES[0],
    author: "DAILY_BYTE",
    marketInfo: { kospi: null, kosdaq: null, usdKrw: null },
    text: `국내 대형 IT 기업들이 자체 AI 플랫폼을 연이어 출시하며 시장 주도권 잡기에 나섰다. 글로벌 빅테크와의 경쟁이 본격화되는 가운데, 국내 기업들은 데이터와 서비스 생태계를 무기로 차별화에 나서고 있다.

업계 관계자는 "국내 시장 특성에 맞춘 한국어 성능과 규제 대응 역량이 핵심 경쟁력"이라고 말한다. 특히 공공·금융 분야에서의 도입 사례가 빠르게 늘고 있다.

향후 6개월 안에 B2B API 상용화와 에이전트 기능 확대가 예상되며, 스타트업과의 파트너십도 활발해질 전망이다.`,
  },
  {
    id: "mock-002",
    title: "💰10년 은둔생활을 마치고 사회생활을 시작했어요",
    description:
      "머니로그 코너에서 보라씨 님의 재무 고민과 어피티의 솔루션을 다룹니다. 비상금 확보와 지출 관리가 우선이라는 조언이 담겨 있습니다.",
    category: "경제",
    categorySlug: "economy",
    source: "UPPITY",
    date: "2026.06.05",
    relativeTime: "2시간 전",
    readMinutes: 8,
    imageUrl: PLACEHOLDER_IMAGES[1],
    author: "UPPITY",
    marketInfo: {
      kospi: "7,208.95",
      kosdaq: "1,056.07",
      usdKrw: "1,506.80",
    },
    text: `코스피 7,208.95, 코스닥 1,056.07, 원-달러 환율 1,506.80. 어제 국내 증시는 외국인 매도세에 7,200선까지 밀렸다가 일부 반등하며 마감했다.

머니로그에서는 은둔 생활을 마치고 다시 사회에 발을 내딛은 보라씨 님의 사연을 다룬다. 오피스텔 매매 이후 비상금이 거의 소진된 상황에서, ISA와 주택청약을 어떻게 조정할지가 핵심 고민이다.

어피티의 솔루션은 세 가지다. 첫째, 3개월치 고정비를 커버할 약 400만 원의 비상금을 파킹통장에 우선 확보한다. 둘째, 3소비는 플렉스 통장으로 예산을 분리한다. 셋째, 연금저축은 소액이라도 꾸준히 유지해 복리 효과의 시간을 확보한다.`,
  },
  {
    id: "mock-003",
    title: "네카오 주가, 실적은 괜찮은데 왜 이럴까",
    description:
      "네이버와 카카오의 1분기 실적은 개선됐지만 주가는 부진하다. AI 시대 성장 서사를 증명하지 못한 것이 원인으로 분석된다.",
    category: "경제",
    categorySlug: "economy",
    source: "UPPITY",
    date: "2026.06.04",
    relativeTime: "4시간 전",
    readMinutes: 6,
    imageUrl: PLACEHOLDER_IMAGES[2],
    author: "UPPITY",
    marketInfo: {
      kospi: "7,208.95",
      kosdaq: "1,056.07",
      usdKrw: "1,506.80",
    },
    text: `올해 코스피가 전 세계에서 가장 많이 올랐다는 소식이 무색하게 소외된 대표 종목이 네이버와 카카오다. 1분기 실적은 개선됐지만, 시장은 미래 성장 동력에 의문을 제기하고 있다.

AI 검색과 에이전트 확산으로 네이버의 검색 점유율이 흔들릴 수 있다는 우려가 크다. 카카오는 R&D 비용을 줄이고 외부 AI와 협업하는 전략을 택했지만, 아직 시장을 설득할 만큼의 성과는 보여주지 못했다.

다만 하반기 AI 서비스 수익화와 비핵심 계열사 정리가 진행된다면, 밸류에이션 재평가의 계기가 될 수 있다는 관측도 나온다.`,
  },
  {
    id: "mock-004",
    title: "애플, 새로운 AR 글래스 공개 예고",
    description:
      "AR 글래스 시장에 본격적으로 뛰어든 애플이 새로운 웨어러블 디바이스를 공개했다. 메타와의 경쟁 구도가 심화된다.",
    category: "테크",
    categorySlug: "tech",
    source: "DAILY_BYTE",
    date: "2026.06.04",
    relativeTime: "5시간 전",
    readMinutes: 4,
    imageUrl: PLACEHOLDER_IMAGES[3],
    author: "DAILY_BYTE",
    marketInfo: { kospi: null, kosdaq: null, usdKrw: null },
    text: `애플이 차세대 AR 글래스 라인업을 예고하며 웨어러블 시장의 판도 변화를 예고했다. 기존 비전 프로 대비 가벼운 무게와 일상 착용성을 강조했다.

업계에서는 2027년 정식 출시를 전망하고 있으며, 앱스토어와의 연동을 통한 콘텐츠 생태계가 승패를 가를 것으로 본다. 국내 디스플레이·광학 모듈 관련주도 함께 주목받고 있다.`,
  },
  {
    id: "mock-005",
    title: "GPT-5 출시 임박, AI 생태계 지각변동 예고",
    description:
      "OpenAI가 차세대 대규모 언어모델의 출시를 예고하며 AI 업계 전체에 큰 영향을 미칠 것으로 전망된다.",
    category: "AI 뉴스",
    categorySlug: "ai",
    source: "DAILY_BYTE",
    date: "2026.06.03",
    relativeTime: "1일 전",
    readMinutes: 5,
    imageUrl: PLACEHOLDER_IMAGES[4],
    author: "DAILY_BYTE",
    marketInfo: { kospi: null, kosdaq: null, usdKrw: null },
    text: `OpenAI가 차세대 모델 GPT-5의 출시를 앞두고 있으며, 멀티모달 추론과 에이전트 자율성이 크게 강화될 것으로 알려졌다.

클라우드 사업자와 API 가격 정책, 오픈소스 모델과의 격차 등 업계 전반이 재편될 수 있다는 분석이 나온다. 국내 기업들도 파트너십과 자체 모델 고도화를 동시에 추진 중이다.`,
  },
  {
    id: "mock-006",
    title: "글로벌 주식시장 회복세, 투자자 심리 개선",
    description:
      "미국과 아시아 주요 주식시장이 회복세로 돌아서며 투자자 심리가 개선되고 있다.",
    category: "경제",
    categorySlug: "economy",
    source: "UPPITY",
    date: "2026.06.03",
    relativeTime: "1일 전",
    readMinutes: 4,
    imageUrl: PLACEHOLDER_IMAGES[5],
    author: "UPPITY",
    marketInfo: {
      kospi: "7,271.66",
      kosdaq: "1,084.36",
      usdKrw: "1,498.20",
    },
    text: `미국 증시는 기술주 중심으로 반등했고, 국내 증시도 외국인 순매수 전환 기대감에 상승 마감했다. 금리 인하 시점에 대한 기대가 자산시장 심리를 받치고 있다.

다만 지정학 리스크와 원자재 가격 변동성은 여전히 변수로 남아 있다. 전문가들은 분산 투자와 현금 비중 관리를 권고한다.`,
  },
  {
    id: "mock-007",
    title: "디지털 전환 가속화, 중소기업 지원 확대",
    description:
      "정부가 중소기업의 디지털 전환을 위한 새로운 지원 정책을 발표했다.",
    category: "정책",
    categorySlug: "policy",
    source: "UPPITY",
    date: "2026.06.02",
    relativeTime: "2일 전",
    readMinutes: 4,
    imageUrl: PLACEHOLDER_IMAGES[0],
    author: "UPPITY",
    marketInfo: { kospi: null, kosdaq: null, usdKrw: null },
    text: `정부가 중소기업 디지털 전환을 위한 바우처와 컨설팅 지원을 확대한다고 발표했다. AI 도입, 클라우드 전환, 사이버 보안 강화가 지원 대상이다.

업계 단체는 실질적인 현장 컨설팅과 인력 확보 방안이 함께 마련돼야 효과가 있을 것이라고 강조했다.`,
  },
  {
    id: "mock-008",
    title: "기후 변화 대응, 테크 업계의 새로운 도전",
    description:
      "탄소 중립을 향한 테크 업계의 혁신적인 접근 방식을 분석한다.",
    category: "이슈",
    categorySlug: "issue",
    source: "DAILY_BYTE",
    date: "2026.06.02",
    relativeTime: "2일 전",
    readMinutes: 5,
    imageUrl: PLACEHOLDER_IMAGES[1],
    author: "DAILY_BYTE",
    marketInfo: { kospi: null, kosdaq: null, usdKrw: null },
    text: `글로벌 테크 기업들이 데이터센터 전력 효율과 재생에너지 사용 비중을 높이며 탄소 감축에 나서고 있다. 반도체 공정 개선과 냉각 기술 혁신이 핵심 과제다.

투자자들은 ESG 공시 강화와 규제 대응 비용을 함께 주시하고 있으며, 장기적으로는 친환경 인프라가 경쟁력의 일부가 될 것이라는 전망이 지배적이다.`,
  },
  {
    id: "mock-009",
    title: "금리 인하 전망, 부동산 시장 영향 분석",
    description:
      "중앙은행의 금리 인하가 부동산 시장에 미칠 영향을 전망한다.",
    category: "경제",
    categorySlug: "economy",
    source: "UPPITY",
    date: "2026.06.01",
    relativeTime: "3일 전",
    readMinutes: 5,
    imageUrl: PLACEHOLDER_IMAGES[2],
    author: "UPPITY",
    marketInfo: {
      kospi: "7,150.00",
      kosdaq: "1,040.00",
      usdKrw: "1,512.00",
    },
    text: `시장에서는 하반기 기준금리 인하 가능성이 커지고 있다. 주택담보대출 금리 하락은 실수요자 심리에 긍정적이지만, 공급 물량과 규제 정책이 함께 작용할 것으로 본다.

전세·매매가 동반 상승보다는 거래 회복과 질적 개선에 무게를 둘 가능성이 크다는 분석이 나온다.`,
  },
  {
    id: "mock-010",
    title: "구글 제미나이 2.0, 멀티모달 기능 강화",
    description:
      "구글이 제미나이 2.0의 주요 업데이트 내용을 발표했다.",
    category: "AI 뉴스",
    categorySlug: "ai",
    source: "DAILY_BYTE",
    date: "2026.05.31",
    relativeTime: "4일 전",
    readMinutes: 4,
    imageUrl: PLACEHOLDER_IMAGES[3],
    author: "DAILY_BYTE",
    marketInfo: { kospi: null, kosdaq: null, usdKrw: null },
    text: `구글이 I/O 행사에서 제미나이 2.0 업데이트를 공개했다. 실시간 멀티모달 추론과 개인용 AI 에이전트 기능이 핵심이다.

안드로이드·크롬·워크스페이스 전반에 통합 배포될 예정이며, 개발자 API 요금 정책도 일부 조정된다.`,
  },
  {
    id: "mock-011",
    title: "국내 AI 스타트업, 글로벌 시장 진출 가속화",
    description:
      "주요 AI 스타트업들이 북미와 유럽 시장에 진출하며 글로벌 확장에 박차를 가하고 있다.",
    category: "AI 뉴스",
    categorySlug: "ai",
    source: "DAILY_BYTE",
    date: "2026.05.30",
    relativeTime: "5일 전",
    readMinutes: 4,
    imageUrl: PLACEHOLDER_IMAGES[4],
    author: "DAILY_BYTE",
    marketInfo: { kospi: null, kosdaq: null, usdKrw: null },
    text: `국내 AI 스타트업들이 북미·유럽 시장 진출을 본격화하고 있다. B2B SaaS와 산업 특화 모델이 주를 이룬다.

VC 업계는 글로벌 매출 비중과 현지 규제 대응 역량을 투자 심사의 핵심 지표로 삼고 있다고 밝혔다.`,
  },
  {
    id: "mock-012",
    title: "💰올해 발동된 사이드카만 20번이라고?",
    description:
      "머니레터에서 사이드카 발동 빈도와 투자자 대응 전략을 짚는다. 단기 변동성 확대 국면에서의 체크포인트를 정리했다.",
    category: "경제",
    categorySlug: "economy",
    source: "UPPITY",
    date: "2026.05.29",
    relativeTime: "6일 전",
    readMinutes: 7,
    imageUrl: PLACEHOLDER_IMAGES[5],
    author: "UPPITY",
    marketInfo: {
      kospi: "7,180.00",
      kosdaq: "1,062.00",
      usdKrw: "1,505.00",
    },
    text: `올해 들어 사이드카가 잦게 발동되며 단기 변동성이 커지고 있다. 프로그램 매매와 외국인 수급이 겹치는 구간에서 개인 투자자들의 대응이 어려워지는 양상이다.

전문가들은 레버리지 축소, 분할 매수·매도, 현금 비중 관리를 강조한다. 장기 투자 관점에서는 펀더멘털 변화 여부를 우선 확인하라는 조언이 이어진다.`,
  },
];
