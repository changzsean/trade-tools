import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { AlibabaToken } from "@/lib/alibaba/iop";
import { requiredAlibabaCookieSecret } from "@/lib/alibaba/iop";

function key(): Buffer {
  return createHash("sha256").update(requiredAlibabaCookieSecret(), "utf8").digest();
}

function encode(value: Buffer): string {
  return value.toString("base64url");
}

function decode(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export function sealAlibabaToken(token: AlibabaToken): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const payload = JSON.stringify({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_in: token.expires_in,
    refresh_expires_in: token.refresh_expires_in,
    account_id: token.account_id,
    account_platform: token.account_platform,
    country: token.country,
  });
  const ciphertext = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return [encode(iv), encode(cipher.getAuthTag()), encode(ciphertext)].join(".");
}

export function openAlibabaToken(value: string): AlibabaToken {
  const [ivPart, tagPart, ciphertextPart] = value.split(".");
  if (!ivPart || !tagPart || !ciphertextPart) throw new Error("Invalid Alibaba token cookie");
  const decipher = createDecipheriv("aes-256-gcm", key(), decode(ivPart));
  decipher.setAuthTag(decode(tagPart));
  const plaintext = Buffer.concat([decipher.update(decode(ciphertextPart)), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext) as AlibabaToken;
}

export function tokenCookieMaxAge(token: AlibabaToken): number {
  const refreshLifetime = token.refresh_expires_in ?? 60 * 60 * 24 * 30;
  return Math.max(300, Math.min(refreshLifetime, 60 * 60 * 24 * 90));
}
