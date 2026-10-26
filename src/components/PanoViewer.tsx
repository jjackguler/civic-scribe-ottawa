import { useEffect, useRef, useState } from "react";

// A small 360° viewer for equirectangular stills: one WebGL quad, no dependency.
// Drag or use the arrow keys to look around; the wheel or +/− zooms.

const VERT = `attribute vec2 p; varying vec2 v; void main(){ v=p; gl_Position=vec4(p,0.,1.); }`;
const FRAG = `precision highp float; varying vec2 v; uniform sampler2D t; uniform float lon, lat, fov, aspect;
void main(){
  float f = tan(fov*.5);
  vec3 d = normalize(vec3(v.x*f*aspect, v.y*f, -1.));
  float cl = cos(lat), sl = sin(lat);
  d = vec3(d.x, d.y*cl + d.z*sl, -d.y*sl + d.z*cl);
  float co = cos(lon), so = sin(lon);
  d = vec3(d.x*co - d.z*so, d.y, d.x*so + d.z*co);
  float u = atan(d.x, -d.z) / 6.2831853 + .5;
  float w = acos(clamp(d.y, -1., 1.)) / 3.1415927;
  gl_FragColor = texture2D(t, vec2(u, w));
}`;

type View = { lon: number; lat: number; fov: number };

export function PanoViewer({ src, label }: { src: string; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<View>({ lon: 0, lat: 0, fov: 1.35 });
  const draw = useRef<() => void>(() => {});
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const c = canvas.current;
    const gl = c?.getContext("webgl", { antialias: false, preserveDrawingBuffer: false });
    if (!c || !gl) {
      setState("error");
      return;
    }
    const sh = (type: number, code: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, code);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const tex = gl.createTexture();
    let ready = false,
      frame = 0;

    const render = () => {
      frame = 0;
      if (!ready) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(c.clientWidth * dpr),
        h = Math.round(c.clientHeight * dpr);
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      gl.viewport(0, 0, w, h);
      const v = view.current;
      gl.uniform1f(u("lon"), v.lon);
      gl.uniform1f(u("lat"), v.lat);
      gl.uniform1f(u("fov"), v.fov);
      gl.uniform1f(u("aspect"), w / Math.max(1, h));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    draw.current = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    setState("loading");
    view.current = { lon: 0, lat: 0, fov: 1.35 };
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      ready = true;
      setState("ready");
      draw.current();
    };
    img.onerror = () => setState("error");
    img.src = src;

    const ro = new ResizeObserver(() => draw.current());
    ro.observe(c);
    return () => {
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
      img.onload = null;
    };
  }, [src]);

  const nudge = (dLon: number, dLat: number, dFov = 0) => {
    const v = view.current;
    v.lon += dLon;
    v.lat = Math.max(-1.45, Math.min(1.45, v.lat + dLat));
    v.fov = Math.max(0.5, Math.min(1.7, v.fov + dFov));
    draw.current();
  };

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      nudge(0, 0, e.deltaY * 0.0015);
    };
    c.addEventListener("wheel", wheel, { passive: false });
    return () => c.removeEventListener("wheel", wheel);
  }, []);

  const drag = useRef<{ x: number; y: number } | null>(null);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-black overflow-hidden rounded-sm">
      <canvas
        ref={canvas}
        tabIndex={0}
        role="img"
        aria-label={`${label}. 360-degree view: drag or use the arrow keys to look around, plus and minus to zoom.`}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const k = view.current.fov / Math.max(1, e.currentTarget.clientHeight);
          nudge(-(e.clientX - drag.current.x) * k, (e.clientY - drag.current.y) * k);
          drag.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          const step = 0.12;
          const keys: Record<string, [number, number, number]> = {
            ArrowLeft: [-step, 0, 0],
            ArrowRight: [step, 0, 0],
            ArrowUp: [0, step, 0],
            ArrowDown: [0, -step, 0],
            "+": [0, 0, -0.1],
            "=": [0, 0, -0.1],
            "-": [0, 0, 0.1],
          };
          const k = keys[e.key];
          if (k) {
            e.preventDefault();
            nudge(...k);
          }
        }}
      />
      {state !== "ready" && (
        <div className="absolute inset-0 grid place-items-center text-white/70 text-sm pointer-events-none">
          {state === "loading"
            ? "Loading the 360° view…"
            : "This browser could not show the 360° view."}
        </div>
      )}
      {state === "ready" && (
        <p className="absolute left-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-[0.78rem] text-white/85 pointer-events-none">
          Drag to look around
        </p>
      )}
    </div>
  );
}
