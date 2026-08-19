import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { AnalysisReport } from "@/lib/types";
import { governmentRegistryStats, enrichWebMatchesWithGovernmentTrust } from "@/lib/government/registry";
import { readSafeExif } from "@/lib/image/exif";
import { analyzeWithGoogleVision } from "@/lib/image/vision";
import { searchPublicPresence } from "@/lib/presence";
import { validateConfirmedName } from "@/lib/safety";
import { userFromAuthorization } from "@/lib/auth";
import { saveAnalysis } from "@/lib/persist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("image");
    const confirmedPublicName = validateConfirmedName(form.get("confirmedPublicName")?.toString() ?? null);
    if (!(file instanceof File)) return NextResponse.json({ error: "Image is required." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Use JPG, PNG or WEBP." }, { status: 415 });

    const maxMb = Number(process.env.MAX_IMAGE_MB ?? "4");
    if (!Number.isFinite(maxMb) || maxMb <= 0) throw new Error("MAX_IMAGE_MB is invalid.");
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json({ error: `Image exceeds ${maxMb} MB.` }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesDeclaredImageType(buffer, file.type)) {
      return NextResponse.json({ error: "File content does not match the declared image type." }, { status: 415 });
    }
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    const warnings: string[] = [
      "Source-based verification only. The app does not identify an unknown person from facial appearance.",
      "Facebook/Instagram results are public search candidates and are not proof of account ownership."
    ];

    const metadataPromise = readSafeExif(buffer);
    const visionPromise = analyzeWithGoogleVision(buffer).then(
      (data) => ({ data, error: null as string | null }),
      (e: unknown) => ({ data: null, error: e instanceof Error ? e.message : "Google Vision failed." })
    );
    const presencePromise = confirmedPublicName
      ? searchPublicPresence(confirmedPublicName)
      : Promise.resolve({ matches: [], status: { presence: "skipped: public name required for social/web profile search" } });

    const [metadata, visionResult, presence] = await Promise.all([metadataPromise, visionPromise, presencePromise]);
    if (visionResult.error) warnings.push(`Image provider unavailable: ${visionResult.error}`);
    if (!confirmedPublicName) warnings.push("Public presence search skipped: enter a public name you already know to search Bangladesh Government sources, Facebook, Instagram, Wikipedia, official sites and news.");
    if (confirmedPublicName && Object.values(presence.status).some((v) => v === "search provider not configured")) {
      warnings.push("General web search provider is not configured. Add BRAVE_SEARCH_API_KEY (recommended) or the supported fallback credentials in Vercel.");
    }

    const vision = visionResult.data
      ? { ...visionResult.data, matches: enrichWebMatchesWithGovernmentTrust(visionResult.data.matches) }
      : null;

    const stats = governmentRegistryStats();
    const trustedWebMatches = vision?.matches.filter((m) => m.governmentTrust?.level === "trusted_registry").length ?? 0;
    const unlistedGovBdMatches = vision?.matches.filter((m) => m.governmentTrust?.level === "gov_bd_unlisted").length ?? 0;

    if (trustedWebMatches > 0) {
      warnings.push(`${trustedWebMatches} image/web source match(es) found on domains listed in the uploaded Bangladesh Government master registry.`);
    }

    const report: AnalysisReport = {
      image: {
        fileName: file.name || "upload",
        mimeType: file.type,
        sizeBytes: file.size,
        sha256
      },
      confirmedPublicName,
      metadata,
      vision,
      presence: presence.matches,
      governmentVerification: {
        registryVersion: stats.checked,
        sourceCount: stats.sourceCount,
        uniqueDomains: stats.uniqueDomains,
        trustedWebMatches,
        unlistedGovBdMatches,
        coverageNote: stats.coverageNote
      },
      providerStatus: {
        googleVision: visionResult.error ? visionResult.error : "ok",
        governmentRegistry: `loaded ${stats.sourceCount} records / ${stats.uniqueDomains} unique domains; checked ${stats.checked}`,
        ...presence.status
      },
      warnings,
      createdAt: new Date().toISOString()
    };

    const user = await userFromAuthorization(request);
    if (user) {
      try {
        const id = await saveAnalysis(user.id, report);
        if (id) report.id = id;
      } catch (e) {
        report.warnings.push(e instanceof Error ? e.message : "History save failed.");
      }
    }

    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unexpected error." }, { status: 500 });
  }
}

function matchesDeclaredImageType(buffer: Buffer, mime: string): boolean {
  if (mime === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
  if (mime === "image/webp") return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  return false;
}
