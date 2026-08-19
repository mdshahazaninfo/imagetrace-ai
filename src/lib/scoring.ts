import type { PresenceCategory } from "@/lib/types";

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

export function scoreTextualCandidate(
  publicName: string,
  title: string,
  snippet: string,
  category: PresenceCategory
): number {
  const targetTokens = normalize(publicName).split(" ").filter((t) => t.length > 1);
  const haystack = normalize(`${title} ${snippet}`);
  if (!targetTokens.length) return 25;
  const hits = targetTokens.filter((t) => haystack.includes(t)).length;
  const ratio = hits / targetTokens.length;
  let score = 25 + ratio * 55;
  if (["wikipedia", "official_website", "company_or_org"].includes(category)) score += 8;
  if (category === "facebook" || category === "instagram") score += 3;
  return Math.max(1, Math.min(95, Math.round(score)));
}

export function confidenceLabel(score: number): string {
  if (score >= 85) return "Strong textual candidate";
  if (score >= 70) return "Good textual candidate";
  if (score >= 50) return "Possible candidate";
  return "Weak candidate";
}
