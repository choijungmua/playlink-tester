import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const MAILER_USER = process.env.MAILER_USER;
const MAILER_PASSWORD = process.env.MAILER_PASSWORD;

const transporter =
  MAILER_USER && MAILER_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: MAILER_USER,
          pass: MAILER_PASSWORD,
        },
      })
    : null;

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
  if (!MAILER_USER || !MAILER_PASSWORD || !transporter) {
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
    await transporter.sendMail({
      from: `"플레이링크" <${MAILER_USER}>`,
      to: email,
      subject: `[플레이링크] ${platformLabel} 테스트 신청이 접수되었습니다.`,
      text: [
        `${name}님,`,
        "",
        `${platformLabel} 테스트 신청이 완료되었습니다.`,
        "곧 사용 안내 메일을 보내드릴 예정입니다.",
        "",
        "- 플레이링크 드림 -",
      ].join("\n"),
      html: [
        `<p>${name}님,</p>`,
        `<p>${platformLabel} 테스트 신청이 완료되었습니다.</p>`,
        "<p>곧 사용 안내 메일을 보내드릴 예정입니다.</p>",
        "<p>- 플레이링크 드림 -</p>",
      ].join(""),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[email] sendMail error", error);
    return NextResponse.json(
      { message: "이메일 발송에 실패했습니다." },
      { status: 500 },
    );
  }
}
