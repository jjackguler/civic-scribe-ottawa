import assert from "node:assert/strict";
import { adsenseReady, adsTxt, loadAdsense, pushAd } from "../src/lib/ads";

// A real-format ID is required for verification, but must not enable serving.
assert.equal(adsenseReady("ca-pub-1234567890123456", false), false);
assert.equal(adsenseReady("", true), false);
assert.equal(adsenseReady("ca-pub-placeholder", true), false);
assert.equal(adsenseReady("ca-pub-1234567890123456", true), true);
assert.equal(adsenseReady(), false, "Unapproved serving must remain off");
assert.match(adsTxt(), /^google\.com, pub-2619122418823802, DIRECT, f08c47fec0942fa0$/m);

// Verification-only setup must not create a global ad queue or touch the DOM.
const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const fakeWindow = {};
Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
try {
  await loadAdsense(true);
  pushAd();
  assert.deepEqual(fakeWindow, {});
} finally {
  if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
  else Reflect.deleteProperty(globalThis, "window");
}
console.log("PASS AdSense verification and serving are separated; disabled loader and queue are inert.");
