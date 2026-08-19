import exifr from "exifr";
import type { SafeExif } from "@/lib/types";

export async function readSafeExif(buffer: Buffer): Promise<SafeExif> {
  try {
    const data = await exifr.parse(buffer, [
      "Make",
      "Model",
      "Software",
      "DateTimeOriginal",
      "Artist",
      "Copyright",
      "Orientation"
    ]);
    return {
      make: data?.Make,
      model: data?.Model,
      software: data?.Software,
      capturedAt: data?.DateTimeOriginal instanceof Date ? data.DateTimeOriginal.toISOString() : data?.DateTimeOriginal,
      artist: data?.Artist,
      copyright: data?.Copyright,
      orientation: data?.Orientation,
      preciseGpsProcessed: false
    };
  } catch {
    return { preciseGpsProcessed: false };
  }
}
