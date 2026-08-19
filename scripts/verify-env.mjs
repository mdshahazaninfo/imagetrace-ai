const requiredForCore = ["GOOGLE_VISION_API_KEY"];
const optionalGroups = [
  ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
  ["BRAVE_SEARCH_API_KEY"],
  ["GOOGLE_CSE_API_KEY", "GOOGLE_CSE_CX"]
];

let failed = false;
for (const key of requiredForCore) {
  if (!process.env[key]) {
    console.warn(`Missing core variable: ${key}`);
    failed = true;
  }
}

for (const group of optionalGroups) {
  const set = group.filter((k) => process.env[k]);
  if (set.length > 0 && set.length !== group.length) {
    console.warn(`Partial optional group configured: ${group.join(", ")}`);
  }
}

if (!process.env.BRAVE_SEARCH_API_KEY && !process.env.GOOGLE_CSE_API_KEY) {
  console.warn("No general web search provider configured. Wikipedia will still work.");
}

if (failed) process.exitCode = 1;
else console.log("Core environment check passed.");
