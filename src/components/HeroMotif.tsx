import type { Motif } from "@/lib/hero-motif";

/**
 * Living covers for the front-page stage: a small animated illustration chosen
 * from what the story is about (Gemini's twin stars, a chatbot's typing bubbles,
 * a chip's running traces, scales of justice, a radar…). Pure SVG and CSS
 * (`.hm-*` in styles.css), so it costs no image request and stops for
 * reduced-motion readers. It is a graphic, never a picture made to look like a
 * news photo: "full" fills the stage when the story has no photo, "badge" is a
 * small corner sticker beside a publisher's photo, never on top of its subject.
 */
/** Deterministic scatter so server and client draw the same stars. */
function scatter(seed: string, n: number, w: number, h: number) {
  let x = 2166136261;
  for (const c of seed) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  const r = () =>
    ((x = Math.imul(x ^ (x >>> 15), 2246822507) ^ Math.imul(x ^ (x >>> 13), 3266489909)) >>> 0) /
    4294967296;
  return Array.from({ length: n }, () => [r() * w, r() * h, 0.6 + r() * 1.6, r() * 4] as const);
}

const NIGHT = "#0b2a2f",
  INK = "#06171a",
  SIG = "#f5c400",
  IVORY = "#efe8da",
  BRASS = "#c9a24d",
  LIVE = "#d7372f";

export function HeroMotif({
  motif,
  seed,
  variant = "full",
}: {
  motif: Motif;
  seed: string;
  variant?: "full" | "badge";
}) {
  const stars = scatter(seed, variant === "full" ? 46 : 14, 480, 230);
  return (
    <svg
      viewBox="0 0 480 360"
      preserveAspectRatio="xMidYMid slice"
      className={`hm hm-${motif} absolute inset-0 h-full w-full`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`hm-sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={INK} />
          <stop offset="1" stopColor={NIGHT} />
        </linearGradient>
        <radialGradient id={`hm-glow-${seed}`}>
          <stop offset="0" stopColor={SIG} stopOpacity="0.45" />
          <stop offset="1" stopColor={SIG} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="360" fill={`url(#hm-sky-${seed})`} />
      {stars.map(([x, y, r, d], i) => (
        <circle
          key={i}
          className="hm-tw"
          cx={x}
          cy={y}
          r={r}
          fill={IVORY}
          style={{ animationDelay: `${-d}s` }}
        />
      ))}
      <Scene motif={motif} seed={seed} />
    </svg>
  );
}

function Scene({ motif, seed }: { motif: Motif; seed: string }) {
  switch (motif) {
    case "gemini":
      return (
        <g>
          <circle cx="240" cy="170" r="120" fill={`url(#hm-glow-${seed})`} className="hm-pulse" />
          <ellipse
            cx="240"
            cy="170"
            rx="110"
            ry="46"
            fill="none"
            stroke={IVORY}
            strokeOpacity=".25"
            strokeDasharray="3 7"
          />
          <g className="hm-orbit" style={{ transformOrigin: "240px 170px" }}>
            <Sparkle x={130} y={170} r={22} fill={SIG} />
            <Sparkle x={350} y={170} r={16} fill={IVORY} />
          </g>
          <path
            className="hm-draw"
            pathLength={1}
            d="M60 60 L120 40 L180 78 L250 46 L320 70 L410 38"
            fill="none"
            stroke={SIG}
            strokeOpacity=".7"
            strokeWidth="1.6"
          />
          {[
            [60, 60],
            [120, 40],
            [180, 78],
            [250, 46],
            [320, 70],
            [410, 38],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.6"
              fill={SIG}
              className="hm-tw"
              style={{ animationDelay: `${-i * 0.4}s` }}
            />
          ))}
          <Sparkle x={400} y={290} r={9} fill={SIG} cls="hm-pop" delay={0.6} />
          <Sparkle x={80} y={280} r={7} fill={IVORY} cls="hm-pop" delay={2.1} />
        </g>
      );
    case "chat":
      return (
        <g>
          {[
            [70, 90, 210, IVORY, 0],
            [200, 170, 210, SIG, 1.4],
            [90, 250, 170, IVORY, 2.8],
          ].map(([x, y, w, c, d], i) => (
            <g key={i} className="hm-pop" style={{ animationDelay: `${d}s` }}>
              <rect
                x={x as number}
                y={y as number}
                width={w as number}
                height="56"
                rx="24"
                fill={c as string}
              />
              <path
                d={
                  i === 1
                    ? `M${(x as number) + (w as number) - 40} ${(y as number) + 50} l26 22 l-6 -26z`
                    : `M${(x as number) + 30} ${(y as number) + 50} l-18 22 l34 -14z`
                }
                fill={c as string}
              />
              {[0, 1, 2].map((k) => (
                <circle
                  key={k}
                  className="hm-dots"
                  cx={(x as number) + 36 + k * 26}
                  cy={(y as number) + 28}
                  r="7"
                  fill={NIGHT}
                  style={{ animationDelay: `${k * 0.18}s` }}
                />
              ))}
            </g>
          ))}
          <rect className="hm-blink-cursor" x="300" y="268" width="4" height="30" fill={SIG} />
        </g>
      );
    case "chip": {
      const traces = [
        "M240 170 H60 V70",
        "M240 170 H420 V90",
        "M240 170 V320 H110",
        "M240 170 V30 H340",
        "M240 170 H400 V300",
        "M240 170 H90 V290",
      ];
      return (
        <g>
          {traces.map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke={IVORY} strokeOpacity=".22" strokeWidth="3" />
              <path
                className="hm-run"
                pathLength={1}
                d={d}
                fill="none"
                stroke={SIG}
                strokeWidth="3"
                strokeLinecap="round"
                style={{ animationDelay: `${-i * 0.55}s` }}
              />
            </g>
          ))}
          <rect
            x="190"
            y="120"
            width="100"
            height="100"
            rx="8"
            fill={INK}
            stroke={SIG}
            strokeWidth="3"
          />
          {Array.from({ length: 6 }, (_, k) => (
            <g key={k}>
              <rect x={196 + k * 16} y="108" width="6" height="12" fill={BRASS} />
              <rect x={196 + k * 16} y="220" width="6" height="12" fill={BRASS} />
            </g>
          ))}
          <rect
            className="hm-pulse"
            x="215"
            y="145"
            width="50"
            height="50"
            rx="4"
            fill={SIG}
            fillOpacity=".85"
          />
        </g>
      );
    }
    case "power":
      return (
        <g>
          {[90, 240, 390].map((x, i) => (
            <g key={i} stroke={IVORY} strokeOpacity=".7" strokeWidth="3" fill="none">
              <path
                d={`M${x - 26} 330 L${x} 120 L${x + 26} 330 M${x - 40} 150 H${x + 40} M${x - 30} 190 H${x + 30} M${x - 18} 250 L${x + 18} 210 M${x + 18} 250 L${x - 18} 210`}
              />
            </g>
          ))}
          {[150, 190].map((y, i) => (
            <g key={i}>
              <path
                d={`M50 ${y} Q165 ${y + 40} 280 ${y} T510 ${y}`}
                fill="none"
                stroke={IVORY}
                strokeOpacity=".35"
                strokeWidth="2"
              />
              <path
                className="hm-run"
                pathLength={1}
                d={`M50 ${y} Q165 ${y + 40} 280 ${y} T510 ${y}`}
                fill="none"
                stroke={SIG}
                strokeWidth="3"
                style={{ animationDelay: `${-i * 0.9}s` }}
              />
            </g>
          ))}
          <path
            className="hm-flicker"
            d="M300 40 L270 110 L298 110 L276 175 L330 92 L302 92 L322 40 Z"
            fill={SIG}
          />
        </g>
      );
    case "robot":
      return (
        <g>
          <line x1="240" y1="60" x2="240" y2="100" stroke={IVORY} strokeWidth="4" />
          <circle className="hm-pulse" cx="240" cy="54" r="10" fill={LIVE} />
          <rect x="150" y="100" width="180" height="150" rx="26" fill={IVORY} />
          <rect x="170" y="128" width="140" height="62" rx="18" fill={INK} />
          {[205, 275].map((x, i) => (
            <circle key={i} className="hm-eye" cx={x} cy="159" r="14" fill={SIG} />
          ))}
          {Array.from({ length: 7 }, (_, k) => (
            <rect
              key={k}
              className="hm-eq"
              x={186 + k * 16}
              y="206"
              width="9"
              height="28"
              rx="3"
              fill={NIGHT}
              style={{ animationDelay: `${-k * 0.13}s` }}
            />
          ))}
          <rect x="128" y="150" width="22" height="50" rx="8" fill={BRASS} />
          <rect x="330" y="150" width="22" height="50" rx="8" fill={BRASS} />
        </g>
      );
    case "image":
      return (
        <g>
          <rect x="90" y="60" width="300" height="220" fill={IVORY} />
          {[
            [SIG, "M110 220 C170 120 250 280 370 110"],
            [LIVE, "M110 120 C190 200 260 70 370 210"],
            [NIGHT, "M120 260 C200 210 300 270 360 240"],
          ].map(([c, d], i) => (
            <path
              key={i}
              className="hm-paint"
              pathLength={1}
              d={d}
              fill="none"
              stroke={c}
              strokeWidth={22 - i * 5}
              strokeLinecap="round"
              style={{ animationDelay: `${i * 0.9}s` }}
            />
          ))}
          {[SIG, LIVE, BRASS, IVORY].map((c, i) => (
            <circle
              key={i}
              className="hm-bob"
              cx={130 + i * 70}
              cy="318"
              r="14"
              fill={c}
              style={{ animationDelay: `${-i * 0.35}s` }}
            />
          ))}
        </g>
      );
    case "law":
      return (
        <g>
          <rect x="236" y="90" width="8" height="200" fill={BRASS} />
          <rect x="190" y="290" width="100" height="14" fill={BRASS} />
          <g className="hm-tilt" style={{ transformOrigin: "240px 96px" }}>
            <rect x="110" y="92" width="260" height="8" rx="4" fill={IVORY} />
            {[120, 360].map((x, i) => (
              <g
                key={i}
                className={i ? "hm-hang-r" : "hm-hang-l"}
                style={{ transformOrigin: `${x}px 96px` }}
              >
                <path
                  d={`M${x} 96 L${x - 40} 190 M${x} 96 L${x + 40} 190`}
                  stroke={IVORY}
                  strokeOpacity=".6"
                  strokeWidth="2"
                />
                <path d={`M${x - 52} 190 Q${x} 230 ${x + 52} 190 Z`} fill={i ? SIG : IVORY} />
              </g>
            ))}
          </g>
          <circle cx="240" cy="90" r="10" fill={SIG} />
        </g>
      );
    case "money":
      return (
        <g>
          {[90, 140, 110, 190, 160, 240].map((h, i) => (
            <rect
              key={i}
              className="hm-rise"
              x={70 + i * 58}
              y={320 - h}
              width="40"
              height={h}
              fill={i === 5 ? SIG : IVORY}
              fillOpacity={i === 5 ? 1 : 0.75}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
          <path
            className="hm-draw"
            pathLength={1}
            d="M90 250 L148 205 L206 228 L264 160 L322 182 L390 96"
            fill="none"
            stroke={SIG}
            strokeWidth="4"
          />
          <g className="hm-coin" style={{ transformOrigin: "400px 60px" }}>
            <circle cx="400" cy="60" r="26" fill={SIG} />
            <text x="400" y="70" textAnchor="middle" fontSize="28" fontWeight="800" fill={NIGHT}>
              $
            </text>
          </g>
        </g>
      );
    case "security":
      return (
        <g>
          {[60, 110, 160].map((r) => (
            <circle
              key={r}
              cx="240"
              cy="180"
              r={r}
              fill="none"
              stroke={SIG}
              strokeOpacity=".3"
              strokeWidth="2"
            />
          ))}
          <g className="hm-sweep" style={{ transformOrigin: "240px 180px" }}>
            <path d="M240 180 L240 20 A160 160 0 0 1 380 100 Z" fill={SIG} fillOpacity=".22" />
            <line x1="240" y1="180" x2="240" y2="20" stroke={SIG} strokeWidth="3" />
          </g>
          {[
            [300, 120],
            [170, 230],
            [330, 250],
          ].map(([x, y], i) => (
            <circle
              key={i}
              className="hm-blip"
              cx={x}
              cy={y}
              r="7"
              fill={LIVE}
              style={{ animationDelay: `${i * 1.1}s` }}
            />
          ))}
          <rect x="218" y="168" width="44" height="34" rx="5" fill={IVORY} />
          <path
            d="M228 168 v-12 a12 12 0 0 1 24 0 v12"
            fill="none"
            stroke={IVORY}
            strokeWidth="6"
          />
        </g>
      );
    case "bias": {
      const cols = [SIG, LIVE, "#6fe0d0", "#b48cff"];
      return (
        <g>
          {Array.from({ length: 48 }, (_, k) => {
            const c = k % 4,
              x = 70 + (k % 8) * 48,
              y = 70 + Math.floor(k / 8) * 42;
            return (
              <circle
                key={k}
                className={`hm-sort hm-sort-${c}`}
                cx={x}
                cy={y}
                r="11"
                fill={cols[c]}
                style={{ animationDelay: `${(k % 5) * 0.08}s` }}
              />
            );
          })}
        </g>
      );
    }
    default:
      return (
        <g>
          <circle cx="390" cy="70" r="26" fill={IVORY} fillOpacity=".9" />
          {[
            [30, 170, 70],
            [110, 120, 80],
            [200, 190, 60],
            [270, 100, 90],
            [370, 160, 80],
          ].map(([x, top, w], b) => (
            <g key={b}>
              <rect x={x} y={top} width={w} height={360 - top} fill={INK} />
              {Array.from({ length: Math.floor((360 - top - 20) / 22) * 3 }, (_, k) => {
                const cx = x + 10 + ((k % 3) * (w - 20)) / 2.4,
                  cy = top + 14 + Math.floor(k / 3) * 22;
                return (k * 7 + b) % 3 ? (
                  <rect
                    key={k}
                    className="hm-win"
                    x={cx}
                    y={cy}
                    width="9"
                    height="11"
                    fill={SIG}
                    style={{ animationDelay: `${-((k * 13 + b * 5) % 9) * 0.6}s` }}
                  />
                ) : null;
              })}
            </g>
          ))}
        </g>
      );
  }
}

function Sparkle({
  x,
  y,
  r,
  fill,
  cls = "",
  delay = 0,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  cls?: string;
  delay?: number;
}) {
  const q = r * 0.28;
  return (
    <path
      className={cls}
      style={cls ? { animationDelay: `${delay}s` } : undefined}
      d={`M${x} ${y - r} Q${x + q} ${y - q} ${x + r} ${y} Q${x + q} ${y + q} ${x} ${y + r} Q${x - q} ${y + q} ${x - r} ${y} Q${x - q} ${y - q} ${x} ${y - r} Z`}
      fill={fill}
    />
  );
}
