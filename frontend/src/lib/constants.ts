import type { CategorySlug } from "./types";

export const CATEGORIES: {
  slug: CategorySlug;
  label: string;
  description: string;
}[] = [
  {
    slug: "ai",
    label: "AI 뉴스",
    description:
      "인공지능 기술, 산업 동향, 연구 개발 소식을 빠르게 전합니다.",
  },
  {
    slug: "tech",
    label: "테크",
    description: "테크 산업의 최신 동향과 혁신 소식을 전합니다.",
  },
  {
    slug: "economy",
    label: "경제",
    description: "국내외 경제 이슈와 시장 동향을 분석합니다.",
  },
  {
    slug: "policy",
    label: "정책",
    description: "정부 정책과 규제 변화를 빠르게 전달합니다.",
  },
  {
    slug: "issue",
    label: "이슈",
    description: "사회적 이슈와 트렌드를 깊이 있게 다룹니다.",
  },
];

/** HTTP 200 확인된 Unsplash URL만 (백엔드 articleImages.ts와 동기화) */
export const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&q=80",
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1080&q=80",
  "https://images.unsplash.com/photo-1763788427834-95dec952e9cd?w=1080&q=80",
  "https://images.unsplash.com/photo-1656428764153-6224cbaa1fe4?w=1080&q=80",
  "https://images.unsplash.com/photo-1745270917331-787c80129680?w=1080&q=80",
  "https://images.unsplash.com/photo-1658909896496-3a9c405ca472?w=1080&q=80",
  "https://images.unsplash.com/photo-1692021483655-c440e9f332c1?w=1080&q=80",
  "https://images.unsplash.com/photo-1762369879879-33497b98e1de?w=1080&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&q=80",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1080&q=80",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1080&q=80",
  "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?w=1080&q=80",
  "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1080&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1080&q=80",
  "https://images.unsplash.com/photo-1559526324-593bc073d938?w=1080&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1080&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1080&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&q=80",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1080&q=80",
];

export const TICKER_FALLBACK = [
  "OpenAI, 새로운 멀티모달 AI 발표",
  "반도체 업계 2분기 실적 호조",
  "정부, AI 규제 프레임워크 발표",
];
