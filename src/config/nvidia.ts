export const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY ?? "";

export const NVIDIA_FLUX_ENABLED = NVIDIA_API_KEY.startsWith("nvapi-");

export const NVIDIA_FLUX_ENDPOINT =
  "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell";

/** 블로그 카드용 가로형 (16:9에 가까움) */
export const FLUX_IMAGE_WIDTH = 1344;
export const FLUX_IMAGE_HEIGHT = 768;
export const FLUX_STEPS = 4;
/** 품질 검증 실패 시 최대 재시도 횟수 */
export const FLUX_MAX_ATTEMPTS = Number(process.env.FLUX_MAX_ATTEMPTS ?? 3);
