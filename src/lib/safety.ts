const disallowedIntentPatterns = [
  /home\s*address/i,
  /current\s*location/i,
  /live\s*location/i,
  /phone\s*number/i,
  /private\s*(facebook|instagram|account|profile)/i,
  /identify\s*(this|the)\s*person/i,
  /who\s+is\s+(this|he|she)/i
];

export function validateConfirmedName(input: string | null): string | undefined {
  const value = (input ?? "").trim().replace(/\s+/g, " ");
  if (!value) return undefined;
  if (value.length > 120) throw new Error("Public name is too long.");
  if (disallowedIntentPatterns.some((rx) => rx.test(value))) {
    throw new Error("Enter only a public name, not a request for private identity/location data.");
  }
  const cleaned = value.replace(/[^\p{L}\p{N}\s.'’\-]/gu, "").replace(/\s+/g, " ").trim();
  if (cleaned.length < 2) throw new Error("Enter a valid public name.");
  return cleaned;
}

export function safeExternalUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
