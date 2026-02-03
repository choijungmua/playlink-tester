import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { tester } from "@/lib/api";

export async function GET(request: NextRequest) {
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

    // 가입자 목록 가져오기
    const result = await tester.get();

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.data.length,
    });
  } catch (error) {
    console.error("가입자 목록 조회 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // 요청 본문에서 testerIds 가져오기
    const body = await request.json();
    const { testerIds } = body;

    if (!testerIds || !Array.isArray(testerIds) || testerIds.length === 0) {
      return NextResponse.json(
        { message: "삭제할 테스터 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 테스터 삭제
    const result = await tester.delete(testerIds);

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount}명의 테스터가 삭제되었습니다.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("테스터 삭제 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
