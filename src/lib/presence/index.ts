import type { PresenceCategory, PresenceMatch } from "@/lib/types";
import { confidenceLabel, scoreTextualCandidate } from "@/lib/scoring";
import { safeExternalUrl } from "@/lib/safety";
import { webSearch } from "@/lib/presence/search-provider";
import { searchWikipedia } from "@/lib/presence/wikipedia";

const queries: Array<{ category: PresenceCategory; make: (name: string) => string }> = [
  { category: "facebook", make: (n) => `site:facebook.com \"${n}\"` },
  { category: "instagram", make: (n) => `site:instagram.com \"${n}\"` },
  { category: "official_website", make: (n) => `\"${n}\" official website` },
  { category: "company_or_org", make: (n) => `\"${n}\" company organization profile` },
  { category: "news", make: (n) => `\"${n}\" news interview biography` }
];

export async function searchPublicPresence(publicName: string): Promise<{ matches: PresenceMatch[]; status: Record<string, string> }> {
  const status: Record<string, string> = {};
  const matches: PresenceMatch[] = [];

  try {
    matches.push(...(await searchWikipedia(publicName)));
    status.wikipedia = "ok";
  } catch (e) {
    status.wikipedia = errorMessage(e);
  }

  for (const item of queries) {
    try {
      const { provider, results } = await webSearch(item.make(publicName), 6);
      status[item.category] = provider === "disabled" ? "search provider not configured" : `ok via ${provider}`;
      for (const r of results) {
        const url = safeExternalUrl(r.url);
        if (!url) continue;
        const snippet = r.description ?? "";
        const confidence = scoreTextualCandidate(publicName, r.title, snippet, item.category);
        matches.push({
          category: item.category,
          title: r.title,
          url,
          snippet,
          provider,
          confidence,
          confidenceLabel: confidenceLabel(confidence)
        });
      }
    } catch (e) {
      status[item.category] = errorMessage(e);
    }
  }

  const deduped = Array.from(new Map(matches.map((m) => [`${m.category}:${m.url}`, m])).values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 40);

  return { matches: deduped, status };
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "unknown error";
}
