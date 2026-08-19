import { NextResponse } from "next/server";
import { userFromAuthorization } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await userFromAuthorization(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const supabase = createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Supabase persistence is not configured." }, { status: 503 });
  const { data, error } = await supabase
    .from("analysis_jobs")
    .select("id, file_name, confirmed_public_name, result, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
