import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
const here = path.dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(await fs.readFile(path.join(here, "..", "src", "data", "bd-government-sources.json"), "utf8"));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) { console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."); process.exit(1); }
const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const rows = registry.d.map((domain) => ({
  category: "government_domain", name_en: domain, url: `https://${domain}`, domain,
  checked_on: registry.v, metadata: { registry: registry.t, workbook_source_rows: registry.r }, is_active: true,
  updated_at: new Date().toISOString()
}));
for (let i = 0; i < rows.length; i += 100) {
  const chunk = rows.slice(i, i + 100);
  const { error } = await supabase.from("trusted_sources").upsert(chunk, { onConflict: "domain" });
  if (error) throw error;
  console.log(`Synced ${Math.min(i + chunk.length, rows.length)}/${rows.length}`);
}
console.log(`Done. ${rows.length} unique government domains; workbook source rows: ${registry.r}.`);
