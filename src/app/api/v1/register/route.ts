import { NextResponse } from "next/server";
import { tester } from "@/lib/api";
import { isMailerConfigured, sendConfirmationEmail } from "@/lib/mailer";

type Platform = "ios" | "android";

type RegisterPayload = {
  name?: unknown;
  email?: unknown;
  platform?: unknown;
};

type RateLimitEntry = {
  count: number;
  firstSeen: number;
};

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const rateLimitStore = new Map<string, RateLimitEntry>();

const PLATFORM_TYPE: Record<Platform, 0 | 1> = {
  ios: 0,
  android: 1,
};

const PLATFORM_LABEL: Record<Platform, string> = {
  ios: "iOS",
  android: "Android",
};

const RATE_LIMIT_MESSAGE =
  "같은 네트워크에서 너무 많은 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.";

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }

  const realIp =
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-client-ip");

  return realIp ?? null;
};

const isRateLimited = (ip: string | null) => {
  if (!ip) return false;
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.firstSeen > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, firstSeen: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ message: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  let payload: RegisterPayload;
  try {
    payload = (await request.json()) as RegisterPayload;
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청 본문입니다." },
      { status: 400 },
    );
  }

  const name =
    typeof payload.name === "string" ? payload.name.trim() : undefined;
  const email =
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : undefined;
  const platform =
    payload.platform === "ios" || payload.platform === "android"
      ? payload.platform
      : undefined;

  if (!name || !email || !platform) {
    return NextResponse.json(
      { message: "이름, 이메일, 플랫폼은 필수입니다." },
      { status: 400 },
    );
  }

  const type = PLATFORM_TYPE[platform];
  const platformLabel = PLATFORM_LABEL[platform];

  const insertResult = await tester.post(name, email, type);
  if (!insertResult.ok) {
    const status = insertResult.status ?? 500;
    return NextResponse.json(
      { message: insertResult.message },
      { status: status === 409 ? 409 : status },
    );
  }

  let emailWarning: string | null = null;
  if (isMailerConfigured) {
    try {
      await sendConfirmationEmail({ name, email, platformLabel });
    } catch (error) {
      console.error("[register] send mail error", error);
      emailWarning =
        error instanceof Error
          ? error.message
          : "이메일 발송 중 문제가 발생했습니다.";
    }
  }

  return NextResponse.json({ success: true, emailWarning });
}
