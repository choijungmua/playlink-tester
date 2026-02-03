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

type InviteEmailArgs = {
  name: string;
  email: string;
  inviteLink: string;
};

export async function sendAndroidInvitationEmail({
  name,
  email,
  inviteLink,
}: InviteEmailArgs) {
  if (!transporter || !MAILER_USER) {
    throw new Error("메일러 설정이 되어 있지 않습니다.");
  }

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>플레이링크 Android 테스트 초대</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0">
          <!-- 로고 -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"}/icon.png" alt="플레이링크" width="80" height="80" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- 제목 -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">플레이링크</h1>
              <p style="margin: 0; font-size: 14px;">Android 테스트 초대</p>
            </td>
          </tr>

          <!-- 본문 -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: bold;">${name}님, 안녕하세요!</p>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6;">
                플레이링크 Android 앱 테스트에 초대되셨습니다.
              </p>

              <p style="margin: 0; font-size: 15px; line-height: 1.6;">
                아래 링크를 클릭하여 Google Play Console에서 테스터로 참여하실 수 있습니다.
              </p>

              <p style="margin: 20px 0 0 0; font-size: 15px; line-height: 1.6;">
                <a href="${inviteLink}" style="color: #0066cc; text-decoration: none;">테스트 참여하기</a>
              </p>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #000000;">
              <p style="margin: 0; font-size: 13px; text-align: center;">
                감사합니다.<br/>
                <strong>플레이링크 팀</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"플레이링크" <${MAILER_USER}>`,
    to: email,
    subject: `[플레이링크] Android 앱 테스트에 초대합니다 🎉`,
    html: htmlTemplate,
  });
}
