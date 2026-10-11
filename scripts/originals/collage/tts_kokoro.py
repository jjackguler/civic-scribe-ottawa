"""Local narration with Kokoro (open weights, Apache 2.0), for previews without
an ElevenLabs key. Writes one WAV for the whole video and a timing JSON:
  python3 tts_kokoro.py storyboard.json out_dir model.onnx voices.bin
"""
import json, os, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

board_path, out_dir, model, voices = sys.argv[1:5]
board = json.load(open(board_path))
k = Kokoro(model, voices)
SR = 24000
E = lambda k, d: float(os.environ.get(k, d))
# Reels run tighter: NARRATE_LEAD_IN=0.1 NARRATE_SCENE_GAP=0.3 NARRATE_SENT_GAP=0.2 NARRATE_TAIL=1.2 KOKORO_SPEED=1.08
SENT_GAP, SCENE_GAP, LEAD_IN, TAIL = E('NARRATE_SENT_GAP', 0.28), E('NARRATE_SCENE_GAP', 0.55), E('NARRATE_LEAD_IN', 0.6), E('NARRATE_TAIL', 1.6)
SPEED = E('KOKORO_SPEED', 1.0)

audio = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
t = LEAD_IN
timing = []
for scene in board["scenes"]:
    start = t
    sents = []
    for i, text in enumerate(scene["say"]):
        samples, sr = k.create(text, voice=board.get("voice", "af_heart"), speed=SPEED, lang="en-us")
        assert sr == SR
        sents.append({"text": text, "start": round(t, 3), "end": round(t + len(samples) / SR, 3)})
        audio.append(samples.astype(np.float32))
        t += len(samples) / SR
        gap = SENT_GAP if i < len(scene["say"]) - 1 else SCENE_GAP
        audio.append(np.zeros(int(gap * SR), dtype=np.float32))
        t += gap
    timing.append({"start": round(start, 3), "end": round(t, 3), "sentences": sents})
audio.append(np.zeros(int(TAIL * SR), dtype=np.float32))
t += TAIL
timing[-1]["end"] = round(t, 3)
sf.write(f"{out_dir}/voice.wav", np.concatenate(audio), SR)
json.dump({"duration": round(t, 3), "scenes": timing}, open(f"{out_dir}/timing.json", "w"), indent=1)
print(f"voice {t:.1f}s")
