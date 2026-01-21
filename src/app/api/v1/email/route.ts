import { NextResponse } from "next/server";
import { isMailerConfigured, sendConfirmationEmail } from "@/lib/mailer";

type EmailPayload = {
  name?: unknown;
  email?: unknown;
  platform?: unknown;
};

const PLATFORM_COPY: Record<string, string> = {
  ios: "iOS",
  android: "Android",
};

export async function POST(request: Request) {
  if (!isMailerConfigured) {
    return NextResponse.json(
      { message: "메일러 설정이 되어 있지 않습니다." },
      { status: 500 },
    );
  }

  let payload: EmailPayload;
  try {
    payload = (await request.json()) as EmailPayload;
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
    typeof payload.platform === "string" ? payload.platform : undefined;

  if (!name || !email) {
    return NextResponse.json(
      { message: "이름과 이메일은 필수입니다." },
      { status: 400 },
    );
  }

  const platformLabel = PLATFORM_COPY[platform ?? ""] ?? "플랫폼";

  try {
    await sendConfirmationEmail({ name, email, platformLabel });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[email] sendMail error", error);
    return NextResponse.json(
      { message: "이메일 발송에 실패했습니다." },
      { status: 500 },
    );
  }
}
