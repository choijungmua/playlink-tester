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

export const isMailerConfigured = Boolean(transporter);

type SendEmailArgs = {
  name: string;
  email: string;
  platformLabel: string;
};

export async function sendConfirmationEmail({
  name,
  email,
  platformLabel,
}: SendEmailArgs) {
  if (!transporter || !MAILER_USER) {
    throw new Error("메일러 설정이 되어 있지 않습니다.");
  }

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
}
