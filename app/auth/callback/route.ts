import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
      const cookieStore = await cookies(); // ⬅️ Aguarda os cookies corretamente
      const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) });
      await supabase.auth.exchangeCodeForSession(code);
    }

    // Redireciona para o dashboard após login
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=auth_callback_failed`);
  }
}
