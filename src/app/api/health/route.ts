import { NextResponse } from "next/server";
import { governmentRegistryStats } from "@/lib/government/registry";

export const runtime = "nodejs";

export async function GET() {
  const registry = governmentRegistryStats();
  return NextResponse.json({
    ok: true,
    providers: {
      googleVision: Boolean(process.env.GOOGLE_VISION_API_KEY),
      braveSearch: Boolean(process.env.BRAVE_SEARCH_API_KEY),
      googleCseLegacy: Boolean(process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX),
      supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    },
    governmentRegistry: {
      loaded: true,
      checked: registry.checked,
      sourceCount: registry.sourceCount,
      uniqueDomains: registry.uniqueDomains
    }
  });
}
