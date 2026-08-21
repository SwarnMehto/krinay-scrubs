import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const SESSION_COOKIE = "krinay_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type SessionPayload = {
  userId: string;
  exp: number;
};

function getSessionSecret() {
  const configured = process.env.AUTH_SESSION_SECRET?.trim();

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV !== "production") {
    return "krinay-local-dev-session-secret-change-before-production";
  }

  throw new Error("AUTH_SESSION_SECRET missing hai.");
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function createSessionToken(userId: string) {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function readSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split(".");

  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (!payload.userId || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return readSessionToken(token)?.userId ?? null;
}

export function attachSessionCookie(
  response: NextResponse,
  userId: string,
) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: createSessionToken(userId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
