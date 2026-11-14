// Booth Guard key generation. Run on your own machine; nothing is sent anywhere.
//
//   node scripts/booth-guard-keygen.mjs server
//     Prints BOOTH_SIGNING_KEY (put it in Vercel env, keep it secret) and the server public key
//     (pin it in the kiosk build: src/shared/guardPins.ts -> SERVER_PUBLIC_KEY).
//
//   node scripts/booth-guard-keygen.mjs recovery <file>
//     Writes the offline recovery private key to <file> (keep it on a USB stick or print it, never in a repo)
//     and prints its public key (pin it in the kiosk build -> RECOVERY_PUBLIC_KEYS, and add it to
//     the BOOTH_RECOVERY_PUBKEYS env so the dashboard accepts recovery commands).

import { generateKeyPairSync } from "crypto";
import { existsSync, writeFileSync } from "fs";

const [kind, file] = process.argv.slice(2);
const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const pub = publicKey.export({ format: "der", type: "spki" }).toString("base64");

if (kind === "server") {
  console.log("BOOTH_SIGNING_KEY=" + privateKey.export({ format: "der", type: "pkcs8" }).toString("base64"));
  console.log("SERVER_PUBLIC_KEY=" + pub);
} else if (kind === "recovery" && file) {
  if (existsSync(file)) {
    console.error(`Refusing to overwrite ${file}`);
    process.exit(1);
  }
  writeFileSync(file, privateKey.export({ format: "pem", type: "pkcs8" }), { mode: 0o600 });
  console.log(`Recovery private key written to ${file}`);
  console.log("RECOVERY_PUBLIC_KEY=" + pub);
} else {
  console.error("Usage: node scripts/booth-guard-keygen.mjs server | recovery <file>");
  process.exit(1);
}
