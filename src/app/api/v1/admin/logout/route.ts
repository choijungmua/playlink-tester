import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // 쿠키 삭제
    cookieStore.delete("admin_token");

    return NextResponse.json(
      { message: "로그아웃 성공" },
      { status: 200 }
    );
  } catch (error) {
    console.error("로그아웃 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
