import type {
  GetTestersResult,
  InsertResult,
  InviteTestersResult,
  DeleteTestersResult,
} from "./type";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export const tester = {
  /**
   * 모든 테스터 조회
   */
  get: async (): Promise<GetTestersResult> => {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tester?select=*&order=created_at.desc`,
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

    let message = "데이터를 불러오는 중 오류가 발생했습니다.";
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

  /**
   * 새 테스터 추가
   */
  post: async (
    name: string,
    email: string,
    type: number
  ): Promise<InsertResult> => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tester`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ name, email, type }),
    });

    if (response.ok) {
      return { ok: true };
    }

    let message = "알 수 없는 오류가 발생했습니다.";
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

  /**
   * 테스터 초대 (invite 상태 업데이트)
   */
  patch: {
    invite: async (testerIds: string[]): Promise<InviteTestersResult> => {
      try {
        // 1. tester 테이블의 invite 컬럼 업데이트
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/tester?id=in.(${testerIds.join(",")})`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ invite: true }),
          }
        );

        if (!updateResponse.ok) {
          return {
            ok: false,
            status: updateResponse.status,
            message: "테스터 초대 상태 업데이트에 실패했습니다.",
          };
        }

        // 2. history 테이블에 기록 추가
        const now = new Date().toISOString();
        const historyRecords = testerIds.map((id) => ({
          tester_id: id,
          invited: true,
          invited_at: now,
          notes: "관리자 페이지에서 초대됨",
        }));

        const historyResponse = await fetch(`${SUPABASE_URL}/rest/v1/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(historyRecords),
        });

        if (!historyResponse.ok) {
          return {
            ok: false,
            status: historyResponse.status,
            message: "히스토리 기록에 실패했습니다.",
          };
        }

        return {
          ok: true,
          invitedCount: testerIds.length,
        };
      } catch (error) {
        return {
          ok: false,
          status: 500,
          message: "초대 처리 중 오류가 발생했습니다.",
        };
      }
    },
  },

  /**
   * 테스터 삭제
   */
  delete: async (testerIds: string[]): Promise<DeleteTestersResult> => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/tester?id=in.(${testerIds.join(",")})`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          message: "테스터 삭제에 실패했습니다.",
        };
      }

      return {
        ok: true,
        deletedCount: testerIds.length,
      };
    } catch (error) {
      return {
        ok: false,
        status: 500,
        message: "삭제 처리 중 오류가 발생했습니다.",
      };
    }
  },
};
