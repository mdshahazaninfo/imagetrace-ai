import registryJson from "@/data/bd-government-sources.json";
import type { GovernmentTrust, TrustedGovernmentSource, WebMatch } from "@/lib/types";

type RawRegistry = { t: string; v: string; r: number; u: number; note: string; d: string[] };
const registry = registryJson as RawRegistry;
const sources: TrustedGovernmentSource[] = registry.d.map((domain) => ({
  category: "government_domain",
  nameBn: "",
  nameEn: domain,
  url: `https://${domain}`,
  domain: normalizeDomain(domain),
  source: "Uploaded Bangladesh Government Websites Master List",
  checked: registry.v
}));
const byDomain = new Map(sources.map((source) => [source.domain, source]));

export function governmentRegistryStats() {
  return { title: registry.t, checked: registry.v, sourceCount: registry.r, uniqueDomains: registry.u, coverageNote: registry.note };
}

export function classifyGovernmentUrl(url: string): GovernmentTrust | undefined {
  const domain = domainFromUrl(url);
  if (!domain) return undefined;
  const exact = byDomain.get(domain);
  if (exact) return {
    level: "trusted_registry",
    label: "Bangladesh Government source (master-list match)",
    domain,
    registryChecked: registry.v,
    source: exact
  };
  if (domain === "gov.bd" || domain.endsWith(".gov.bd")) return {
    level: "gov_bd_unlisted",
    label: "gov.bd domain (not listed in uploaded master registry)",
    domain,
    registryChecked: registry.v
  };
  return undefined;
}

export function enrichWebMatchesWithGovernmentTrust(matches: WebMatch[]): WebMatch[] {
  return matches.map((match) => ({ ...match, governmentTrust: classifyGovernmentUrl(match.url) }));
}
export function trustedGovernmentSources(): readonly TrustedGovernmentSource[] { return sources; }
export function domainFromUrl(url: string): string | null {
  try { return normalizeDomain(new URL(url).hostname); } catch { return null; }
}
function normalizeDomain(value: string): string { return value.trim().toLowerCase().replace(/^www\./, "").replace(/\.$/, ""); }
