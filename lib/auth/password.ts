import "server-only";

import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password minimum 8 characters ka hona chahiye.");
  }

  const salt = crypto.randomBytes(16).toString("base64url");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
) {
  const [scheme, salt, hash] = storedHash.split("$");

  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(hash, "base64url");

  return (
    storedBuffer.length === derivedKey.length &&
    crypto.timingSafeEqual(storedBuffer, derivedKey)
  );
}
