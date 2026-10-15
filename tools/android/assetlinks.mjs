import { mkdir, writeFile } from "node:fs/promises";
const fingerprints = process.argv.slice(2).map((s) => s.toUpperCase());
if (
  !fingerprints.length ||
  fingerprints.some((s) => !/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(s) || /^00(:00){31}$/.test(s))
) {
  throw new Error(
    "Provide the real SHA-256 app-signing certificate fingerprint(s), colon-separated hex. Never use a placeholder.",
  );
}
const dir = new URL("../../public/.well-known/", import.meta.url);
await mkdir(dir, { recursive: true });
await writeFile(
  new URL("assetlinks.json", dir),
  JSON.stringify(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.aibroadsheet.brief",
          sha256_cert_fingerprints: [...new Set(fingerprints)],
        },
      },
    ],
    null,
    2,
  ) + "\n",
);
console.log(
  "Created assetlinks.json from supplied public signing certificate. Deploy only on the verified app origin.",
);
