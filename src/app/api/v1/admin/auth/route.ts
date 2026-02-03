import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { admin } from "@/lib/api/admin";

// 간단한 토큰 생성 (실제 프로덕션에서는 더 안전한 방법 사용)
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { message: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // DB에서 관리자 비밀번호 가져오기
    const passwordResult = await admin.getPassword();

    if (!passwordResult.ok) {
      console.error("관리자 비밀번호 조회 실패:", passwordResult.message);
      return NextResponse.json(
        { message: "서버 설정 오류입니다." },
        { status: 500 }
      );
    }

    // 비밀번호 확인
    if (password !== passwordResult.password) {
      return NextResponse.json(
        { message: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 인증 성공 - 쿠키 설정
    const token = generateToken();
    const cookieStore = await cookies();

    cookieStore.set("admin_token", token, {
      httpOnly: true, // JavaScript에서 접근 불가 (XSS 방지)
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
      sameSite: "strict", // CSRF 방지
      maxAge: 60 * 60 * 24, // 24시간
      path: "/",
    });

    return NextResponse.json(
      { message: "로그인 성공" },
      { status: 200 }
    );
  } catch (error) {
    console.error("관리자 인증 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
