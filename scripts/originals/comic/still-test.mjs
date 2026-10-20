// Generates a few test panels with Gemini to judge the art direction. No audio, no publishing.
import { writeFile, mkdir } from "node:fs/promises";
const KEY = process.env.GEMINI_API_KEY?.trim();
const MODELS = ["gemini-3-pro-image-preview", "gemini-2.5-flash-image"];
const STYLE = "Graphic-novel ink illustration in the style of a premium motion comic: stark Sin City high-contrast black and white, heavy brush-ink shadows, crisp line art, film grain, a single spot colour only where stated, cinematic composition, no text, no letters, no logos, no watermarks. Faces mostly in shadow; no real person's likeness.";
const tests = [
  ["driveway", "16:9", "A suburban driveway in Michigan at dusk in January, light snow on the lawn. A man in a work jacket stands beside his car as a police car pulls in diagonally behind it, its light bar the only colour: burning red and blue reflections on wet asphalt. On the porch, a woman and two small girls watch, silhouetted in the warm doorway. Low angle, wide shot."],
  ["lineup", "16:9", "Six identical rectangular mugshot-style cards pinned in a row on a dark board, each holding a different stylised, faceless male head drawn in bold orange and black flat shapes, long noses, heavy shadows, mid-century cartoon style. A single desk lamp lights the board from above. Spot colour: orange."],
  ["scan", "16:9", "A grainy enlarged surveillance still of a man in a baseball cap seen from above, face hidden by the brim, overlaid by a glowing wireframe mesh of facial-recognition landmarks; scan lines; the cap is the single spot colour: red."],
];
await mkdir("out", { recursive: true });
for (const [name, ar, prompt] of tests) {
  let done = false;
  for (const model of MODELS) {
    if (done) break;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", headers: { "x-goog-api-key": KEY, "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${prompt}\n\nStyle: ${STYLE}` }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: ar } } }),
    });
    if (!res.ok) { console.log(name, model, "HTTP", res.status, (await res.text()).slice(0, 300)); continue; }
    const body = await res.json(); const part = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) { console.log(name, model, "no image", body.candidates?.[0]?.finishReason); continue; }
    await writeFile(`out/${name}.png`, Buffer.from(part.inlineData.data, "base64")); console.log(name, "ok via", model); done = true;
  }
}
