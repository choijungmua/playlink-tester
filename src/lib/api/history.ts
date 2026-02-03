import type { GetHistoryResult } from "./type";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export const history = {
  /**
   * 특정 테스터의 히스토리 조회
   */
  get: async (testerId: string): Promise<GetHistoryResult> => {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/history?tester_id=eq.${testerId}&select=*&order=created_at.desc`,
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
      return { ok: true, data };
    }

    return {
      ok: false,
      status: response.status,
      message: "히스토리를 불러오는 중 오류가 발생했습니다.",
    };
  },

  /**
   * 전체 히스토리 조회
   */
  getAll: async (): Promise<GetHistoryResult> => {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/history?select=*&order=created_at.desc`,
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
      return { ok: true, data };
    }

    return {
      ok: false,
      status: response.status,
      message: "히스토리를 불러오는 중 오류가 발생했습니다.",
    };
  },
};
