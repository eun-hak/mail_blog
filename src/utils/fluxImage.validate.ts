import fs from "node:fs";

/** 1344×768 JPEG로는 비정상적으로 작은 파일 (검은/깨진 이미지) */
export const FLUX_MIN_JPEG_BYTES = 20_000;

export type FluxFinishReason = "SUCCESS" | "ERROR" | "CONTENT_FILTERED" | string;

export function isFluxGenerationSuccessful(
  finishReason: FluxFinishReason | undefined
): boolean {
  return finishReason === "SUCCESS";
}

export function isValidFluxJpegFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (stat.size < FLUX_MIN_JPEG_BYTES) return false;

    const header = Buffer.alloc(3);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, header, 0, 3, 0);
    fs.closeSync(fd);

    return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  } catch {
    return false;
  }
}
