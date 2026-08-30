import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const PRODUCT_COPY_ACCESS_COOKIE = "meeka_product_copy_access";
export const PRODUCT_COPY_ACCESS_MAX_AGE = 60 * 60 * 12;

export function getProductCopyAccessPassword() {
  const password = process.env.PRODUCT_COPY_ACCESS_PASSWORD?.trim();
  return password || null;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function getProductCopyAccessToken() {
  const password = getProductCopyAccessPassword();
  return password ? digest(password).toString("hex") : null;
}

export function isProductCopyPasswordValid(candidate: string) {
  const expected = getProductCopyAccessPassword();
  if (!expected || !candidate) return false;

  return timingSafeEqual(digest(candidate), digest(expected));
}

export async function hasProductCopyAccess() {
  const token = getProductCopyAccessToken();
  if (!token) return false;

  const cookieStore = await cookies();
  return cookieStore.get(PRODUCT_COPY_ACCESS_COOKIE)?.value === token;
}
