import fs from "node:fs";
import path from "node:path";
import { getGeneratedImagesDir } from "../services/nvidiaImage.service.js";

const CHECK_TIMEOUT_MS = 8000;

function isLocalMediaUrl(url: string): boolean {
  return url.startsWith("/api/media/images/");
}

function localMediaExists(url: string): boolean {
  const filename = path.basename(url);
  const filePath = path.join(getGeneratedImagesDir(), filename);
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
  } catch {
    return false;
  }
}

/** HEAD 요청 또는 로컬 파일로 이미지 URL 접근 가능 여부 확인 */
export async function isImageUrlAccessible(url: string): Promise<boolean> {
  if (isLocalMediaUrl(url)) {
    return localMediaExists(url);
  }

  if (!url.startsWith("https://")) return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}
