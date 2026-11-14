// Sign a Booth Guard command with the offline recovery key (when the owner's passkey device is lost).
//
//   node scripts/booth-guard-recovery-sign.mjs <recovery-key.pem> <deviceId> <action> ['{"patch":{...}}']
//
// Prints JSON to paste into Admin -> Booth Guard -> "Kirim command dari recovery key".
// canonicalJSON must stay identical to src/lib/boothGuardShared.ts and the kiosk's protocol.ts.

import { createPrivateKey, randomUUID, sign } from "crypto";
import { readFileSync } from "fs";

const ACTIONS = ["approve", "lock", "unlock", "revoke", "set_config", "restart", "update"];
const [keyFile, deviceId, action, paramsJson] = process.argv.slice(2);
if (!keyFile || !deviceId || !ACTIONS.includes(action)) {
  console.error(`Usage: node scripts/booth-guard-recovery-sign.mjs <key.pem> <deviceId> <${ACTIONS.join("|")}> [paramsJSON]`);
  process.exit(1);
}

function canonicalJSON(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJSON).join(",") + "]";
  return "{" + Object.keys(value).filter((k) => value[k] !== undefined).sort()
    .map((k) => JSON.stringify(k) + ":" + canonicalJSON(value[k])).join(",") + "}";
}

const now = Date.now();
const command = {
  v: 1,
  id: randomUUID(),
  deviceId,
  action,
  params: paramsJson ? JSON.parse(paramsJson) : {},
  issuedAt: now,
  expiresAt: now + 24 * 60 * 60 * 1000,
};
const key = createPrivateKey(readFileSync(keyFile));
const signature = sign(null, Buffer.from(`SEBOOTH-OWNER-V1\n${canonicalJSON(command)}`), key).toString("base64");
console.log(JSON.stringify({ command, assertion: { type: "recovery", signature } }, null, 2));
