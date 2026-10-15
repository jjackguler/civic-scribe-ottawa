import { createRequire } from "node:module";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { TwaManifest, TwaGenerator, ConsoleLog, fetchUtils } = require("@bubblewrap/core");
const root = new URL("../../", import.meta.url);
const output = new URL("android/generated/", root);
await mkdir(output, { recursive: true });
if ((await readdir(output)).length)
  throw new Error("android/generated is not empty; archive it before regenerating.");
const web = JSON.parse(await readFile(new URL("public/manifest.webmanifest", root), "utf8"));
const manifest = TwaManifest.fromWebManifestJson(
  new URL("https://app.aibroadsheet.com/manifest.webmanifest"),
  web,
);
manifest.packageId = "com.aibroadsheet.brief";
manifest.name = "AI Broadsheet: The Brief";
manifest.launcherName = "The Brief";
manifest.startUrl = "/app?source=android";
manifest.appVersionCode = 1;
manifest.appVersionName = "1.0.0";
// Android Browser Helper 2.7.4 requires Android 7.0 or newer.
manifest.minSdkVersion = 24;
manifest.enableNotifications = false;
manifest.fallbackType = "customtabs";
manifest.features = {};
manifest.signingKey = { path: "../../private/brief-upload.keystore", alias: "brief-upload" };
const error = manifest.validate();
if (error) throw new Error(error);
const stable = manifest.toJson();
await mkdir(new URL("android/", root), { recursive: true });
await writeFile(new URL("android/twa-manifest.json", root), JSON.stringify(stable, null, 2) + "\n");
// Only serve the two repo-owned icons to the generator. No live origin dependency.
const icons = new Map();
for (const name of ["icon-512.png", "maskable-512.png"])
  icons.set("/" + name, await readFile(new URL("public/brief/" + name, root)));
const server = createServer((req, res) => {
  if (req.url === "/manifest.webmanifest") {
    res.writeHead(200, { "Content-Type": "application/manifest+json" });
    res.end(JSON.stringify(web));
    return;
  }
  const bytes = icons.get(req.url);
  if (!bytes) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, { "Content-Type": "image/png" });
  res.end(bytes);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const local = `http://127.0.0.1:${server.address().port}`;
  manifest.iconUrl = local + "/icon-512.png";
  manifest.maskableIconUrl = local + "/maskable-512.png";
  fetchUtils.setFetchEngine("node-fetch");
  const fetchOriginal = fetchUtils.fetch.bind(fetchUtils);
  fetchUtils.fetch = (input) =>
    fetchOriginal(
      String(input) === String(manifest.webManifestUrl) ? local + "/manifest.webmanifest" : input,
    );
  await new TwaGenerator().createTwaProject(
    fileURLToPath(output),
    manifest,
    new ConsoleLog("brief"),
  );
  await writeFile(new URL("twa-manifest.json", output), JSON.stringify(stable, null, 2) + "\n");
  const gradleUrl = new URL("build.gradle", output);
  const gradle = await readFile(gradleUrl, "utf8");
  await writeFile(gradleUrl, gradle.replaceAll("jcenter()", "mavenCentral()"));
  console.log("Generated Android TWA project. No release key created; no store submission.");
} finally {
  await new Promise((resolve) => server.close(resolve));
}
