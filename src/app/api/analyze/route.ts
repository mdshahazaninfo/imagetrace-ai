import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { AnalysisReport } from "@/lib/types";
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
      "This report is source-based and does not perform face recognition or unknown-person identification.",
      "Social/web results are textual candidates, not proof that an account belongs to the person in the image."
    ];

    const metadataPromise = readSafeExif(buffer);
    const visionPromise = analyzeWithGoogleVision(buffer).then(
      (data) => ({ data, error: null as string | null }),
      (e: unknown) => ({ data: null, error: e instanceof Error ? e.message : "Google Vision failed." })
    );
    const presencePromise = confirmedPublicName
      ? searchPublicPresence(confirmedPublicName)
      : Promise.resolve({ matches: [], status: { presence: "skipped: no public name supplied" } });

    const [metadata, visionResult, presence] = await Promise.all([metadataPromise, visionPromise, presencePromise]);
    if (visionResult.error) warnings.push(visionResult.error);

    const report: AnalysisReport = {
      image: {
        fileName: file.name || "upload",
        mimeType: file.type,
        sizeBytes: file.size,
        sha256
      },
      confirmedPublicName,
      metadata,
      vision: visionResult.data,
      presence: presence.matches,
      providerStatus: {
        googleVision: visionResult.error ? visionResult.error : "ok",
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
