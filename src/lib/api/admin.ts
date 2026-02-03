const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

type GetPasswordResult =
  | {
      ok: true;
      password: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export const admin = {
  /**
   * 관리자 비밀번호 조회
   */
  getPassword: async (): Promise<GetPasswordResult> => {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/admin?id=eq.1&select=password`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return { ok: true, password: data[0].password };
      }
      return {
        ok: false,
        status: 404,
        message: "관리자 정보를 찾을 수 없습니다.",
      };
    }

    let message = "관리자 정보를 불러오는 중 오류가 발생했습니다.";
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // ignore JSON parse errors
    }

    return {
      ok: false,
      status: response.status,
      message,
    };
  },
};
