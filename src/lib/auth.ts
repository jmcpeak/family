import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { LOGIN_ANSWER_HASH, SESSION_COOKIE_NAME } from "@/lib/constants";
import { serverEnv } from "@/lib/env";
import { hashCode } from "@/lib/member-utils";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

interface SessionPayload {
  exp: number;
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    return JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;
  } catch {
    return null;
  }
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", serverEnv.sessionSecret)
    .update(encodedPayload)
    .digest("base64url");
}

export function createSessionToken(): string {
  const payload: SessionPayload = {
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const encodedPayload = encodePayload(payload);
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifySessionToken(token?: string): boolean {
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }

  const expected = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload) {
    return false;
  }

  return payload.exp > Date.now();
}

export function isValidLoginAnswer(answer: string): boolean {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (serverEnv.loginAnswer) {
    return normalized === serverEnv.loginAnswer.trim().toLowerCase();
  }

  return hashCode(normalized) === LOGIN_ANSWER_HASH;
}

export async function getIsAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function applySessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
