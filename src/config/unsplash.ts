export const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY ?? "";
export const UNSPLASH_ID = process.env.UNSPLASH_ID ?? "";
export const UNSPLASH_SECRET_KEY = process.env.UNSPLASH_SECRET_KEY ?? "";

/** Search API에는 Access Key만 필요 */
export const UNSPLASH_ENABLED = UNSPLASH_ACCESS_KEY.length > 0;
