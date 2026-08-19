export type SearchResult = { title: string; url: string; description?: string };

export async function webSearch(query: string, count = 8): Promise<{ provider: string; results: SearchResult[] }> {
  if (process.env.BRAVE_SEARCH_API_KEY) {
    return { provider: "Brave Search", results: await braveSearch(query, count) };
  }
  if (process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX) {
    return { provider: "Google CSE (legacy)", results: await googleCseSearch(query, count) };
  }
  return { provider: "disabled", results: [] };
}

async function braveSearch(query: string, count: number): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query, count: String(Math.min(20, count)), safesearch: "moderate" });
  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
    headers: { Accept: "application/json", "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY! },
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Brave Search failed (${res.status}).`);
  const json = (await res.json()) as { web?: { results?: Array<{ title?: string; url?: string; description?: string }> } };
  return (json.web?.results ?? []).flatMap((x) => x.title && x.url ? [{ title: x.title, url: x.url, description: x.description }] : []);
}

async function googleCseSearch(query: string, count: number): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    key: process.env.GOOGLE_CSE_API_KEY!,
    cx: process.env.GOOGLE_CSE_CX!,
    q: query,
    num: String(Math.min(10, count))
  });
  const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Google CSE failed (${res.status}).`);
  const json = (await res.json()) as { items?: Array<{ title?: string; link?: string; snippet?: string }> };
  return (json.items ?? []).flatMap((x) => x.title && x.link ? [{ title: x.title, url: x.link, description: x.snippet }] : []);
}
