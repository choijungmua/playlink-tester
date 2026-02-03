import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendAndroidInvitationEmail, isMailerConfigured } from "@/lib/mailer";

type Tester = {
  id: string;
  name: string;
  email: string;
  type: number;
};

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");

    if (!token || !token.value) {
      return NextResponse.json(
        { message: "인증되지 않았습니다." },
        { status: 401 }
      );
    }

    // 메일러 설정 확인
    if (!isMailerConfigured) {
      return NextResponse.json(
        { message: "메일 서버가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 요청 본문에서 testerIds와 inviteLink 가져오기
    const body = await request.json();
    const { testers, inviteLink } = body as {
      testers: Tester[];
      inviteLink: string;
    };

    if (!testers || !Array.isArray(testers) || testers.length === 0) {
      return NextResponse.json(
        { message: "초대할 테스터가 필요합니다." },
        { status: 400 }
      );
    }

    if (!inviteLink) {
      return NextResponse.json(
        { message: "초대 링크가 필요합니다." },
        { status: 400 }
      );
    }

    // 각 테스터에게 이메일 발송
    let successCount = 0;
    let failCount = 0;

    for (const tester of testers) {
      try {
        await sendAndroidInvitationEmail({
          name: tester.name,
          email: tester.email,
          inviteLink,
        });
        successCount++;
      } catch (error) {
        console.error(`이메일 발송 실패 (${tester.email}):`, error);
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${successCount}명에게 초대 이메일을 발송했습니다.${
        failCount > 0 ? ` (실패: ${failCount}명)` : ""
      }`,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error("초대 이메일 발송 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
