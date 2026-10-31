// Server-only thin client for the Gemini API (REST, no SDK). Key lives in GEMINI_API_KEY.
// Free tier note: Google may use free-tier prompts to improve its products, so never send guest photos
// or personal data here — only event names and choices the guest picked.

// Aliases, not pinned versions: Google retires pinned models for new keys (2.5-flash already 404s).
// Lite first: short structured copy does not need the bigger model, and it is the least overloaded.
const MODELS = (process.env.GEMINI_MODELS || "gemini-flash-lite-latest,gemini-flash-latest")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

/**
 * Asks Gemini for JSON matching `schema` (OpenAPI subset), trying each model in turn on overload/404.
 * Returns null on any failure (missing key, quota, timeout, bad JSON) so callers can fall back to static copy.
 */
export async function generateJson<T>(prompt: string, schema: Record<string, unknown>, timeoutMs = 12_000): Promise<T | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  for (const model of MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.9 },
        }),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      if (!res.ok) {
        console.warn(`[gemini] ${res.status} ${model}`);
        // Quota (429) and bad requests will not get better on another model
        if (res.status === 404 || res.status >= 500) continue;
        return null;
      }
      const data = await res.json();
      const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? (JSON.parse(text) as T) : null;
    } catch (err) {
      console.warn(`[gemini] ${model} failed`, err instanceof Error ? err.message : err);
    }
  }
  return null;
}
