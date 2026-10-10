# AI Broadsheet creative desk

Flow project: https://flow.google.com/project/737a6144-c312-4836-8879-f6283bd953a4

The first production asset, **Intelligence unplugged**, was made on 10 October 2026 in the owner's Google Flow Pro account. Image: Nano Banana 2.1, 4:3, one output, UI cost 0 credits. Motion: Omni 1.1 Flash, 720p, 6 seconds, one output, UI cost 10 credits. No additional credits were purchased. Those are the costs shown for this generation, not a promise about future pricing or quotas.

## Art direction

One visual argument per cover. An unexpected physical metaphor, tactile paper, deep teal, warm ivory and one signal-yellow accent. It should remain clear at phone size. Avoid generic robots, neon brains, invented screenshots, documentary-looking allegations and decorative clutter. Put headlines in HTML, not baked into images. Preserve the identity of AI Broadsheet rather than copying another magazine's cover template.

The first illustration shows a folded-paper brain, unplugged yellow cable and separate paper globe: a metaphor for the report about Anthropic isolating its internal evaluations from the internet. It is attached only to story `1l4noah`, not reused for unrelated allegations. The public caption explicitly says **AI illustration · AI Broadsheet**; publisher source credits still identify the reporting.

## Repeatable production

1. Select the story and read its reporting. Write a one-sentence visual idea, separate from factual claims.
2. In the Flow project, choose Nano Banana 2.1, 4:3 and one output. Check the displayed credit cost before generating. Keep Agent mode off for a controlled single generation.
3. Review the resulting image for unintended text, misleading details, faces, brands and composition. Download the 1K original. Keep the source in the owner's archive.
4. Encode a web copy under `public/editorial/` (target under 150 KB). Preserve its proportions; avoid putting text over its subject.
5. Optionally use **Animate** with a restrained motion prompt. One 6-second result is enough. Review frames through the entire clip and remove the audio stream for the silent cover. Keep the MP4 small (target under 1 MB).
6. Add an entry to `src/content/editorial-art.json`: exact story IDs, local image/video paths, English/French descriptive alt text, actual model, creation date and Flow project link. GitHub review and the normal Lovable deployment publish it.
7. Test at 375, 1024 and 1440 pixels. Verify the illustration label and that no MP4 request occurs before **Animate this cover** is clicked. Stop returns to the image and unmounts the video.

This is an operational Flow-to-site publishing workflow, **not an unattended Flow API integration**. No undocumented Flow endpoints, browser cookies or credentials are stored in the repository. Fully automated production would need a separately configured supported API and budget; Flow subscription credits must not be assumed to pay Gemini API bills.

## First cover prompt

Create an original editorial illustration: a sculptural brain built from folded ivory newspaper paper floats over a deep teal studio surface. A vivid yellow ethernet cable emerges from the brain and ends in a disconnected plug beside a separate paper globe. The visible gap is the central idea: intelligence and isolation. Tactile paper, precise folds, hard directional light, crisp shadows, restrained ivory/teal/yellow palette. Strong central 4:3 composition legible on a phone. No words, logos, people, robots or neon circuitry. Clearly a constructed editorial metaphor, never documentary evidence.

## Motion prompt

Preserve the sculpture, disconnected cable and globe exactly. Locked camera. One almost imperceptible rise and fall of the suspended brain; a few paper edges flex softly. Plug stays disconnected throughout. Six seconds, restrained stop-motion tactility. No new objects, text, speech or music.

## Suno

The owner confirms an active Pro account. New tracks can enter the existing `music/owner/` plus `rights.json` workflow described in `music-rights.md`. Record the plan at the time each track was generated. This confirmation does not change the creation date or license record of previously held free-plan tracks. No new Suno track was generated as part of this cover.

References checked 10 October 2026: [Flow models](https://support.google.com/flow/answer/16352836?hl=en), [Flow credits](https://support.google.com/flow/answer/16353333?hl=en), [Nano Banana 2.1 API model](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1?hl=en).
