import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");

    if (!token || !token.value) {
      return NextResponse.json(
        { message: "인증되지 않았습니다." },
        { status: 401 }
      );
    }

    // 토큰이 있으면 인증된 것으로 간주
    // 실제 프로덕션에서는 토큰을 DB나 Redis에 저장하고 검증해야 합니다
    return NextResponse.json(
      { message: "인증됨" },
      { status: 200 }
    );
  } catch (error) {
    console.error("인증 확인 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
