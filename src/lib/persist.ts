import type { AnalysisReport } from "@/lib/types";
import { createServerSupabase } from "@/lib/supabase/server";

export async function saveAnalysis(userId: string, report: AnalysisReport): Promise<string | undefined> {
  if (process.env.SAVE_ANALYSIS_TO_SUPABASE === "false") return undefined;
  const supabase = createServerSupabase();
  if (!supabase) return undefined;
  const { data, error } = await supabase
    .from("analysis_jobs")
    .insert({
      user_id: userId,
      image_sha256: report.image.sha256,
      file_name: report.image.fileName,
      mime_type: report.image.mimeType,
      confirmed_public_name: report.confirmedPublicName ?? null,
      provider_status: report.providerStatus,
      result: report
    })
    .select("id")
    .single();
  if (error) throw new Error(`Could not save analysis: ${error.message}`);
  return data.id as string;
}
