/**
 * Parse a JSON string from site_content, with fallback to default value.
 */
export function parseJsonContent<T>(value: string | undefined, fallback: T): T {
    if (!value) return fallback;
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}
