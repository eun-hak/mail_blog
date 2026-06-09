/** HTTP 200 확인된 Unsplash 썸네일만 포함 (404 ID 제외) */
export const ARTICLE_IMAGES = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
  "https://images.unsplash.com/photo-1763788427834-95dec952e9cd?w=800&q=80",
  "https://images.unsplash.com/photo-1656428764153-6224cbaa1fe4?w=800&q=80",
  "https://images.unsplash.com/photo-1745270917331-787c80129680?w=800&q=80",
  "https://images.unsplash.com/photo-1658909896496-3a9c405ca472?w=800&q=80",
  "https://images.unsplash.com/photo-1692021483655-c440e9f332c1?w=800&q=80",
  "https://images.unsplash.com/photo-1762369879879-33497b98e1de?w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
  "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?w=800&q=80",
  "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80",
];

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
}

/** seed(글 id 등)로 항상 같은 이미지를 고르는 결정적 선택 */
export function pickArticleImage(seed: string): string {
  const index = hashString(seed) % ARTICLE_IMAGES.length;
  return ARTICLE_IMAGES[index];
}

/** 배치 생성·일괄 수정 시 풀 안에서 중복 없이 할당 */
export function createUniqueImageAssigner() {
  const used = new Set<string>();

  return {
    assign(seed: string): string {
      const start = hashString(seed) % ARTICLE_IMAGES.length;
      for (let offset = 0; offset < ARTICLE_IMAGES.length; offset++) {
        const image = ARTICLE_IMAGES[(start + offset) % ARTICLE_IMAGES.length];
        if (!used.has(image)) {
          used.add(image);
          return image;
        }
      }
      return ARTICLE_IMAGES[start];
    },
  };
}
