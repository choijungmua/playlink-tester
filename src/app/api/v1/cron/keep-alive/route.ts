import { tester } from "@/lib/supabase";

export async function GET() {
  const result = await tester.get();

  if (result.ok) {
    console.log(`[Keep-Alive] ✅ Success: ${result.data.length} records`);
    return Response.json({
      success: true,
      count: result.data.length,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error(`[Keep-Alive] ❌ Failed: ${result.message}`);
    return Response.json(
      {
        success: false,
        error: result.message,
      },
      { status: 500 }
    );
  }
}
