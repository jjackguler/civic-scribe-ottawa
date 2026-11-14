import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Move3d, RotateCcw } from "lucide-react";
import { ACTIVITY_ICON, useReducedMotion, useT } from "@/components/YoungLab";
import { box, project, type Box, type Cam } from "@/lib/iso3d";
import type { ActivityId, Tone } from "@/lib/young-lab";
import type { Bi } from "@/lib/i18n";

/**
 * A 3D scene of Young Lab games drawn on a canvas: one block per game, which you
 * can drag to turn and click to open. Everything is drawn in code. The canvas is
 * decoration for sighted mouse and touch users; the same games are always listed
 * as plain links underneath, so keyboards and screen readers lose nothing.
 */

export type SceneBlock = {
  id: ActivityId;
  title: Bi;
  tone: Tone;
  x: number;
  z: number;
  /** Height in scene units. */
  h: number;
  /** Small line in the tooltip (e.g. "8 min"). */
  note: string;
  /** Gold flag on top: a stamp earned. */
  flag?: boolean;
  /** A number painted on top (e.g. lesson order). */
  badge?: string;
};
export type ScenePlate = { x: number; z: number; w: number; d: number; label: string; color: string };

const TONE_HEX: Record<Tone, string> = { sun: "#ffd23f", sky: "#8fd3ff", coral: "#ff9a7a", mint: "#8be3bd", grape: "#cdb8ff" };
const GOLD = "#c9a24d";

export function LabScene3D({
  blocks, plates = [], height = 420, kicker, yaw0 = -0.6, pitch0 = 0.55, dist = 30, fov = 760,
}: {
  blocks: SceneBlock[]; plates?: ScenePlate[]; height?: number; kicker?: string; yaw0?: number; pitch0?: number; dist?: number; fov?: number;
}) {
  const { pick, t } = useT();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cam = useRef({ yaw: yaw0, pitch: pitch0 });
  const touched = useRef(false);
  const [hover, setHover] = useState<{ id: ActivityId; x: number; y: number } | null>(null);
  const hoverId = useRef<ActivityId | null>(null);
  const hits = useRef<{ id: ActivityId; b: Box }[]>([]);
  const [ready, setReady] = useState(false);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const w = cv.clientWidth, h = cv.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const css = getComputedStyle(cv);
    const ink = css.getPropertyValue("--ink").trim() || "#14181a";
    // Narrow screens: pull the camera back so the whole scene fits.
    const narrow = w < 560 ? 1.45 : w < 820 ? 1.15 : 1;
    const c: Cam = { yaw: cam.current.yaw, pitch: cam.current.pitch, cx: w / 2, cy: h * 0.62, fov, dist: dist * narrow };

    // Floor grid, like the audit's paper.
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(20,20,19,0.10)";
    for (let g = -8; g <= 8; g += 2) {
      const a = project(g, 0, -8, c), b = project(g, 0, 8, c), p = project(-8, 0, g, c), q = project(8, 0, g, c);
      if (a && b) { ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke(); }
      if (p && q) { ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(q.sx, q.sy); ctx.stroke(); }
    }

    // Plates under each group, with their label painted on the floor edge.
    for (const pl of plates) {
      const b = box(pl.x, pl.z, pl.w, pl.d, 0.25, pl.color, c, { stroke: "rgba(20,20,19,0.35)", lineWidth: 1 });
      b?.draw(ctx);
      const lp = project(pl.x - pl.w / 2 + 0.2, 0.3, pl.z + pl.d / 2 + 0.2, c);
      if (lp) {
        ctx.font = `700 ${Math.max(10, Math.min(13, lp.scale * 0.45))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.fillStyle = ink;
        ctx.fillText(pl.label.toUpperCase(), lp.sx, lp.sy + 16);
      }
    }

    // Blocks, far to near.
    const list = blocks
      .map(bl => ({ bl, b: box(bl.x, bl.z, 1.5, 1.5, bl.h, TONE_HEX[bl.tone], c, { y0: 0.25, lift: hoverId.current === bl.id ? 1.12 : 1, stroke: hoverId.current === bl.id ? ink : "rgba(20,20,19,0.6)", lineWidth: hoverId.current === bl.id ? 2.4 : 1.3 }) }))
      .filter((e): e is { bl: SceneBlock; b: Box } => !!e.b)
      .sort((a, b) => b.b.depth - a.b.depth);
    hits.current = [];
    for (const { bl, b } of list) {
      b.draw(ctx);
      hits.current.unshift({ id: bl.id, b });
      const top = project(bl.x, bl.h + 0.25, bl.z, c);
      if (!top) continue;
      if (bl.flag) {
        const pole = project(bl.x, bl.h + 1.4, bl.z, c);
        if (pole) {
          ctx.strokeStyle = ink; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(top.sx, top.sy); ctx.lineTo(pole.sx, pole.sy); ctx.stroke();
          ctx.fillStyle = GOLD;
          ctx.beginPath(); ctx.moveTo(pole.sx, pole.sy); ctx.lineTo(pole.sx + 16, pole.sy + 6); ctx.lineTo(pole.sx, pole.sy + 12); ctx.closePath(); ctx.fill();
          ctx.stroke();
        }
      }
      if (bl.badge) {
        const r = Math.max(9, Math.min(15, top.scale * 0.5));
        ctx.fillStyle = "#fff"; ctx.strokeStyle = "#14181a"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(top.sx, top.sy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#14181a"; ctx.font = `800 ${Math.round(r * 1.1)}px ui-monospace, Menlo, monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(bl.badge, top.sx, top.sy + 1);
        ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
      }
    }
  }, [blocks, plates, dist, fov]);

  // Size, first draw, and a slow sway until someone touches it (not under reduced motion).
  useEffect(() => {
    setReady(true);
    const cv = canvasRef.current;
    if (!cv) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(cv);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (!touched.current) {
        cam.current.yaw = yaw0 + Math.sin((now - start) / 2600) * 0.35;
        draw();
        raf = requestAnimationFrame(tick);
      }
    };
    if (!reduce) raf = requestAnimationFrame(tick); else draw();
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [draw, reduce, yaw0]);

  const hitAt = (x: number, y: number) => hits.current.find(h => h.b.hit(x, y))?.id ?? null;

  const drag = useRef<{ x: number; y: number; moved: number; type: string } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    touched.current = true;
    drag.current = { x: e.clientX, y: e.clientY, moved: 0, type: e.pointerType };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const d = drag.current;
    if (d) {
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      d.x = e.clientX; d.y = e.clientY; d.moved += Math.abs(dx) + Math.abs(dy);
      cam.current.yaw += dx * 0.008;
      if (d.type === "mouse") cam.current.pitch = Math.max(0.2, Math.min(1.2, cam.current.pitch + dy * 0.006));
      draw();
      return;
    }
    const id = hitAt(e.clientX - r.left, e.clientY - r.top);
    if (id !== hoverId.current) { hoverId.current = id; draw(); }
    setHover(id ? { id, x: e.clientX - r.left, y: e.clientY - r.top } : null);
  };
  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    drag.current = null;
    if (d && d.moved < 6) {
      const r = e.currentTarget.getBoundingClientRect();
      const id = hitAt(e.clientX - r.left, e.clientY - r.top);
      if (id) navigate({ to: "/labs/young/$activity", params: { activity: id } });
    }
  };
  const reset = () => { cam.current = { yaw: yaw0, pitch: pitch0 }; draw(); };
  const focusBlock = (id: ActivityId | null) => { hoverId.current = id; draw(); };

  const hb = hover ? blocks.find(b => b.id === hover.id) : null;

  return (
    <div className="yl-scene">
      <div ref={wrapRef} className="yl-scene-stage" style={{ height }}>
        {kicker && <p className="yl-kicker yl-scene-tag" aria-hidden="true">{kicker}</p>}
        <p className="yl-scene-hint" aria-hidden="true"><Move3d className="h-4 w-4" />{t("Drag to turn · tap a block to play", "Glisse pour tourner · touche un bloc pour jouer")}</p>
        <canvas
          ref={canvasRef}
          className="yl-scene-canvas"
          aria-hidden="true"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => { drag.current = null; }}
          onPointerLeave={() => { if (!drag.current) { hoverId.current = null; setHover(null); draw(); } }}
        />
        {hb && hover && (
          <div className="yl-scene-tip" style={{ left: Math.min(hover.x + 14, (wrapRef.current?.clientWidth ?? 400) - 220), top: Math.max(8, hover.y - 70) }} aria-hidden="true">
            <p className="font-extrabold">{pick(hb.title)}</p>
            <p className="yl-kicker !text-white/80 mt-0.5">{hb.note}{hb.flag ? ` · ${t("stamp earned", "tampon obtenu")}` : ""}</p>
          </div>
        )}
        {ready && (
          <button type="button" className="yl-scene-reset" onClick={reset}><RotateCcw className="h-4 w-4" aria-hidden="true" />{t("Reset view", "Recentrer")}</button>
        )}
      </div>
      <ul className="yl-scene-legend">
        {blocks.map(b => {
          const I = ACTIVITY_ICON[b.id];
          return (
            <li key={b.id}>
              <Link to="/labs/young/$activity" params={{ activity: b.id }} className={`yl-chip yl-tone-${b.tone}`} onMouseEnter={() => focusBlock(b.id)} onMouseLeave={() => focusBlock(null)} onFocus={() => focusBlock(b.id)} onBlur={() => focusBlock(null)}>
                {b.badge && <span className="yl-kicker">{b.badge}</span>}
                <I className="h-4 w-4" aria-hidden="true" />{pick(b.title)}
                {b.flag && <span className="sr-only">{t(" (stamp earned)", " (tampon obtenu)")}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
