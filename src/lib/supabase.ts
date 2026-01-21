const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("Supabase 환경변수가 설정되지 않았습니다.");
}

type InsertResult = {
  ok: true;
} | {
  ok: false;
  status: number;
  message: string;
};

export async function insertTesterEmail(
  name: string,
  email: string,
  type: number,
): Promise<InsertResult> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      ok: false,
      status: 500,
      message: "Supabase 설정이 누락되었습니다.",
    };
  }

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
}
