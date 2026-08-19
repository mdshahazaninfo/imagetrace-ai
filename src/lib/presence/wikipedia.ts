import type { PresenceMatch } from "@/lib/types";
import { confidenceLabel, scoreTextualCandidate } from "@/lib/scoring";

export async function searchWikipedia(publicName: string): Promise<PresenceMatch[]> {
  const params = new URLSearchParams({
    action: "opensearch",
    search: publicName,
    limit: "5",
    namespace: "0",
    format: "json",
    origin: "*"
  });
  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Wikipedia search failed (${res.status}).`);
  const data = (await res.json()) as [string, string[], string[], string[]];
  const [, titles = [], descriptions = [], urls = []] = data;
  return titles.map((title, i) => {
    const snippet = descriptions[i] ?? "";
    const confidence = scoreTextualCandidate(publicName, title, snippet, "wikipedia");
    return {
      category: "wikipedia",
      title,
      url: urls[i] ?? "https://en.wikipedia.org/",
      snippet,
      provider: "Wikipedia",
      confidence,
      confidenceLabel: confidenceLabel(confidence)
    };
  });
}
