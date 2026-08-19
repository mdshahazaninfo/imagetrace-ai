import { NextResponse } from "next/server";
import { governmentRegistryStats, trustedGovernmentSources } from "@/lib/government/registry";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20") || 20));
  const stats = governmentRegistryStats();

  if (!q) return NextResponse.json({ stats, results: [] });

  const results = trustedGovernmentSources().filter((source) => {
    const haystack = [source.nameBn, source.nameEn, source.domain, source.url, source.category].join(" ").toLowerCase();
    return haystack.includes(q);
  }).slice(0, limit);

  return NextResponse.json({ stats, results });
}
