// Booth Guard pieces shared by the admin page (browser) and the server routes.
// Keep canonicalJSON and parseBoothCommand identical to the kiosk's src/main/guard/protocol.ts:
// the owner signs the hash of canonicalJSON(command), and the kiosk recomputes it byte for byte.

export const BOOTH_ACTIONS = ["approve", "lock", "unlock", "revoke", "set_config", "restart", "update"] as const;
export type BoothAction = (typeof BOOTH_ACTIONS)[number];

export interface BoothCommand {
  v: 1;
  id: string;
  deviceId: string;
  action: BoothAction;
  params: Record<string, unknown>;
  issuedAt: number;
  expiresAt: number;
}

/** A command stays deliverable for a day, so an offline booth can still receive it. */
export const COMMAND_TTL_MS = 24 * 60 * 60 * 1000;

export function canonicalJSON(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJSON).join(",") + "]";
  const obj = value as Record<string, unknown>;
  return (
    "{" +
    Object.keys(obj)
      .filter((k) => obj[k] !== undefined)
      .sort()
      .map((k) => JSON.stringify(k) + ":" + canonicalJSON(obj[k]))
      .join(",") +
    "}"
  );
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseBoothCommand(x: unknown): BoothCommand | null {
  if (!x || typeof x !== "object") return null;
  const c = x as Record<string, unknown>;
  if (c.v !== 1 || typeof c.id !== "string" || !UUID.test(c.id)) return null;
  if (typeof c.deviceId !== "string" || !UUID.test(c.deviceId)) return null;
  if (typeof c.action !== "string" || !(BOOTH_ACTIONS as readonly string[]).includes(c.action)) return null;
  if (!c.params || typeof c.params !== "object" || Array.isArray(c.params)) return null;
  if (typeof c.issuedAt !== "number" || typeof c.expiresAt !== "number") return null;
  if (c.expiresAt <= c.issuedAt || c.expiresAt - c.issuedAt > 7 * COMMAND_TTL_MS) return null;
  return c as unknown as BoothCommand;
}
