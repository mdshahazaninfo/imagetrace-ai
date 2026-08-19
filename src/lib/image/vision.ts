import type { VisionResult, WebMatch } from "@/lib/types";
import { safeExternalUrl } from "@/lib/safety";

type VisionAnnotation = {
  textAnnotations?: Array<{ description?: string }>;
  labelAnnotations?: Array<{ description?: string; score?: number }>;
  logoAnnotations?: Array<{ description?: string; score?: number }>;
  landmarkAnnotations?: Array<{ description?: string; score?: number }>;
  webDetection?: {
    webEntities?: Array<{ description?: string; score?: number }>;
    fullMatchingImages?: Array<{ url?: string }>;
    partialMatchingImages?: Array<{ url?: string }>;
    visuallySimilarImages?: Array<{ url?: string }>;
    pagesWithMatchingImages?: Array<{ url?: string; pageTitle?: string }>;
  };
  error?: { message?: string };
};

export async function analyzeWithGoogleVision(buffer: Buffer): Promise<VisionResult> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_VISION_API_KEY is not configured.");

  const body = {
    requests: [
      {
        image: { content: buffer.toString("base64") },
        features: [
          { type: "WEB_DETECTION", maxResults: 20 },
          { type: "TEXT_DETECTION", maxResults: 20 },
          { type: "LOGO_DETECTION", maxResults: 10 },
          { type: "LANDMARK_DETECTION", maxResults: 10 },
          { type: "LABEL_DETECTION", maxResults: 15 }
        ]
      }
    ]
  };

  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!res.ok) throw new Error(`Google Vision request failed (${res.status}).`);
  const json = (await res.json()) as { responses?: VisionAnnotation[] };
  const a = json.responses?.[0];
  if (!a) throw new Error("Google Vision returned no annotation response.");
  if (a.error?.message) throw new Error(a.error.message);

  const matches: WebMatch[] = [];
  const push = (url: string | undefined, type: WebMatch["type"], title?: string) => {
    if (!url) return;
    const safe = safeExternalUrl(url);
    if (!safe) return;
    matches.push({ url: safe, type, title });
  };

  for (const x of a.webDetection?.fullMatchingImages ?? []) push(x.url, "full");
  for (const x of a.webDetection?.partialMatchingImages ?? []) push(x.url, "partial");
  for (const x of a.webDetection?.pagesWithMatchingImages ?? []) push(x.url, "page", x.pageTitle);
  for (const x of a.webDetection?.visuallySimilarImages ?? []) push(x.url, "similar");

  return {
    text: a.textAnnotations?.[0]?.description ?? "",
    labels: (a.labelAnnotations ?? []).flatMap((x) => x.description ? [{ description: x.description, score: x.score }] : []),
    logos: (a.logoAnnotations ?? []).flatMap((x) => x.description ? [{ description: x.description, score: x.score }] : []),
    landmarks: (a.landmarkAnnotations ?? []).flatMap((x) => x.description ? [{ description: x.description, score: x.score }] : []),
    webEntities: (a.webDetection?.webEntities ?? []).flatMap((x) => x.description ? [{ description: x.description, score: x.score }] : []),
    matches: dedupeMatches(matches)
  };
}

function dedupeMatches(matches: WebMatch[]): WebMatch[] {
  const seen = new Set<string>();
  return matches.filter((m) => {
    const key = `${m.type}:${m.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 60);
}
