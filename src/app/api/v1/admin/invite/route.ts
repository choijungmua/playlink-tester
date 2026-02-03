import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { tester } from "@/lib/api";

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

    // 요청 본문 파싱
    const body = await request.json();
    const { testerIds } = body;

    // 유효성 검사
    if (!testerIds || !Array.isArray(testerIds) || testerIds.length === 0) {
      return NextResponse.json(
        { message: "초대할 테스터를 선택해주세요." },
        { status: 400 }
      );
    }

    // 초대 처리
    const result = await tester.patch.invite(testerIds);

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.invitedCount}명의 테스터를 초대했습니다.`,
      invitedCount: result.invitedCount,
    });
  } catch (error) {
    console.error("테스터 초대 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
