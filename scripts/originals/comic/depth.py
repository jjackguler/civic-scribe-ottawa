"""Depth maps for the painted panels (Depth Anything V2 Large): art/<slug>/<id>.jpg -> art/<slug>/<id>.depth.png
(8-bit, white = near), used by the cinema renderer for 2.5D parallax."""
import glob, os, sys, torch, numpy as np
from PIL import Image, ImageFilter
from transformers import AutoImageProcessor, AutoModelForDepthEstimation
d = sys.argv[1]
proc = AutoImageProcessor.from_pretrained("depth-anything/Depth-Anything-V2-Large-hf")
model = AutoModelForDepthEstimation.from_pretrained("depth-anything/Depth-Anything-V2-Large-hf").cuda().eval().half()
for f in sorted(glob.glob(os.path.join(d, "*.jpg"))):
    im = Image.open(f).convert("RGB")
    x = proc(images=im, return_tensors="pt").to("cuda")
    with torch.no_grad(): p = model(pixel_values=x["pixel_values"].half()).predicted_depth
    p = torch.nn.functional.interpolate(p[:, None].float(), size=(im.height // 2, im.width // 2), mode="bicubic", align_corners=False)[0, 0].cpu().numpy()
    lo, hi = np.percentile(p, 1), np.percentile(p, 99.5); p = np.clip((p - lo) / (hi - lo + 1e-6), 0, 1)
    out = Image.fromarray((p * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.5))
    out.save(f[:-4] + ".depth.png"); print(os.path.basename(f), out.size)
