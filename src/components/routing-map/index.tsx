import { HARNESS_LOGOS, LLM_LOGOS, type Logo } from "@/components/routing-map/logos";
import { HoneycombLogo, HONEYCOMB_ASPECT } from "@/components/ui/honeycomb-logo";

/**
 * The routing diagram: your harness on the left threads every request
 * through the Steeros honeycomb in the center, and the fan-out on the
 * right is the model tree — twenty providers, slightly misplaced, all
 * hanging off the same proxy. One route (DeepSeek, the pilot's
 * workhorse) is drawn in burgundy.
 *
 * Pure SVG so the threads curve crisply at any width; two scenes —
 * a wide fan for md+ and a stacked flow for small screens.
 */

const HARNESS_JITTER = [
  [4, -5],
  [-8, 8],
  [7, -9],
  [-5, 6],
] as const;

const LEAF_JITTER = [
  [10, -10], [-9, 12], [7, -14], [-12, 8],
  [-6, 13], [11, -8], [-13, -9], [8, 15],
  [-10, -13], [6, 9], [-7, 14], [12, -12],
  [-11, 8], [9, -15], [-5, -11], [13, 10],
  [-14, -7], [7, 12], [-8, 14], [10, -8],
] as const;

const MOBILE_LEAF_JITTER = [
  [4, -4], [-3, 5], [3, -5], [-4, 3],
  [2, 4], [-5, -3], [4, 2], [-3, 5],
  [5, -4], [-2, -5], [3, 4], [-4, 2],
  [2, -3], [-5, 4], [4, 5], [-3, -4],
  [5, 3], [-2, 5], [3, -5], [-5, 2],
] as const;

const HIGHLIGHT = 4; // DeepSeek in the LLM list

function LogoGlyph({ logo, cx, cy, slot }: { logo: Logo; cx: number; cy: number; slot: number }) {
  // render at the logo's natural aspect, capped by the slot
  const h = Math.min(slot, slot / logo.aspect);
  const w = h * logo.aspect;
  return (
    <svg
      x={cx - w / 2}
      y={cy - h / 2}
      width={w}
      height={h}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d={logo.path} fill={logo.color} />
    </svg>
  );
}

function Chip({
  cx,
  cy,
  size,
  rx,
  logo,
  slot,
  highlight,
}: {
  cx: number;
  cy: number;
  size: number;
  rx: number;
  logo: Logo;
  slot: number;
  highlight?: boolean;
}) {
  return (
    <g>
      <rect
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
        rx={rx}
        fill="#fff"
        stroke={highlight ? "var(--burgundy)" : "var(--line)"}
        strokeWidth={highlight ? 1.5 : 1}
        style={{ filter: "drop-shadow(0 6px 14px rgba(34,22,26,0.08))" }}
      />
      <LogoGlyph logo={logo} cx={cx} cy={cy} slot={slot} />
    </g>
  );
}

function Label({
  x,
  y,
  text,
  size,
  fill,
  weight = 500,
  spacing,
}: {
  x: number;
  y: number;
  text: string;
  size: number;
  fill: string;
  weight?: number;
  spacing?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={size}
      fontWeight={weight}
      letterSpacing={spacing}
      fill={fill}
    >
      {text}
    </text>
  );
}

function SteerosNode({ cx, cy, r, mark }: { cx: number; cy: number; r: number; mark: number }) {
  const w = mark;
  const h = mark * HONEYCOMB_ASPECT;
  return (
    <g>
      {/* soft burgundy halo */}
      <circle cx={cx} cy={cy} r={r * 1.2} fill="var(--burgundy-tint)" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="#fff"
        stroke="var(--line)"
        strokeWidth={1.5}
        style={{ filter: "drop-shadow(0 12px 28px rgba(34,22,26,0.14))" }}
      />
      <HoneycombLogo
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        className="text-ink"
      />
      <Label
        x={cx}
        y={cy + r + 34}
        text="STEEROS"
        size={14}
        fill="var(--ink)"
        weight={700}
        spacing={2.5}
      />
    </g>
  );
}

function DesktopScene() {
  const SX = 430, SY = 300, R = 44; // steeros center
  const cols = [830, 958, 1086, 1214];
  const rows = [84, 190, 296, 402, 508];

  return (
    <svg
      viewBox="0 0 1280 640"
      role="img"
      aria-label="Routing diagram: requests from your coding harness all pass through Steeros, which routes each one to the right model among twenty providers"
      className="h-auto w-full"
    >
      {/* request threads: harness -> steeros */}
      {HARNESS_LOGOS.map((h, i) => {
        const [jx, jy] = HARNESS_JITTER[i];
        const cx = 84 + jx;
        const cy = [92, 204, 316, 428][i] + jy;
        return (
          <path
            key={h.name}
            d={`M ${cx + 28} ${cy} C ${cx + 120} ${cy}, ${cx + 168} ${SY}, ${SX - R} ${SY}`}
            fill="none"
            stroke="var(--burgundy)"
            strokeOpacity={0.6}
            strokeWidth={1.5}
            className="route-flow"
          />
        );
      })}

      {/* route threads: steeros -> each model */}
      {LLM_LOGOS.map((l, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const [jx, jy] = LEAF_JITTER[i];
        const lx = cols[col] + jx;
        const ly = rows[row] + jy;
        const c1x = 592 + col * 9 + row * 5;
        const c2x = lx - 165;
        const highlighted = i === HIGHLIGHT;
        return (
          <path
            key={l.name}
            d={`M ${SX + R} ${SY} C ${c1x} ${SY}, ${c2x} ${ly}, ${lx - 28} ${ly}`}
            fill="none"
            stroke={highlighted ? "var(--burgundy)" : "rgba(34,22,26,0.15)"}
            strokeOpacity={highlighted ? 0.55 : 1}
            strokeWidth={highlighted ? 1.75 : 1.25}
          />
        );
      })}

      {/* harness chips */}
      {HARNESS_LOGOS.map((h, i) => {
        const [jx, jy] = HARNESS_JITTER[i];
        const cx = 84 + jx;
        const cy = [92, 204, 316, 428][i] + jy;
        return (
          <g key={h.name}>
            <Chip cx={cx} cy={cy} size={56} rx={16} logo={h} slot={26} />
            <Label x={cx} y={cy + 42} text={h.name} size={12} fill="var(--ink)" />
          </g>
        );
      })}

      {/* model chips */}
      {LLM_LOGOS.map((l, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const [jx, jy] = LEAF_JITTER[i];
        const lx = cols[col] + jx;
        const ly = rows[row] + jy;
        return (
          <g key={l.name}>
            <Chip cx={lx} cy={ly} size={56} rx={16} logo={l} slot={40} highlight={i === HIGHLIGHT} />
            <Label x={lx} y={ly + 42} text={l.name} size={11} fill="var(--muted)" />
          </g>
        );
      })}

      <SteerosNode cx={SX} cy={SY} r={R} mark={30} />

      <Label x={84} y={560} text="your harness" size={12} fill="var(--faint)" weight={400} />
      <Label x={1022} y={596} text="the models" size={12} fill="var(--faint)" weight={400} />
    </svg>
  );
}

function MobileScene() {
  const SX = 180, SY = 246, R = 32;
  const hc = [90, 150, 210, 270];
  const cols = [87, 149, 211, 273];
  const rows = [404, 472, 540, 608, 676];

  return (
    <svg
      viewBox="0 0 360 750"
      role="img"
      aria-label="Routing diagram: requests from your coding harness all pass through Steeros, which routes each one to the right model among twenty providers"
      className="h-auto w-full"
    >
      {/* request threads */}
      {HARNESS_LOGOS.map((h, i) => {
        const cx = hc[i] + [3, -4, 2, -3][i];
        const cy = 40 + [-2, 3, -4, 3][i];
        return (
          <path
            key={h.name}
            d={`M ${cx} ${cy + 22} C ${cx} ${cy + 55}, ${SX} ${cy + 90}, ${SX} ${SY - R}`}
            fill="none"
            stroke="var(--burgundy)"
            strokeOpacity={0.6}
            strokeWidth={1.5}
            className="route-flow"
          />
        );
      })}

      {/* route threads */}
      {LLM_LOGOS.map((l, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const [jx, jy] = MOBILE_LEAF_JITTER[i];
        const lx = cols[col] + jx;
        const ly = rows[row] + jy;
        const highlighted = i === HIGHLIGHT;
        return (
          <path
            key={l.name}
            d={`M ${SX} ${SY + R} C ${SX} ${ly - 66}, ${lx} ${ly - 66}, ${lx} ${ly - 22}`}
            fill="none"
            stroke={highlighted ? "var(--burgundy)" : "rgba(34,22,26,0.15)"}
            strokeOpacity={highlighted ? 0.55 : 1}
            strokeWidth={highlighted ? 1.75 : 1.25}
          />
        );
      })}

      {/* harness chips */}
      {HARNESS_LOGOS.map((h, i) => {
        const cx = hc[i] + [3, -4, 2, -3][i];
        const cy = 40 + [-2, 3, -4, 3][i];
        return (
          <g key={h.name}>
            <Chip cx={cx} cy={cy} size={44} rx={12} logo={h} slot={30} />
            <Label x={cx} y={cy + 36} text={h.name} size={10} fill="var(--ink)" />
          </g>
        );
      })}

      {/* model chips */}
      {LLM_LOGOS.map((l, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const [jx, jy] = MOBILE_LEAF_JITTER[i];
        const lx = cols[col] + jx;
        const ly = rows[row] + jy;
        return (
          <g key={l.name}>
            <Chip cx={lx} cy={ly} size={44} rx={12} logo={l} slot={32} highlight={i === HIGHLIGHT} />
            <Label x={lx} y={ly + 30} text={l.name} size={10} fill="var(--muted)" />
          </g>
        );
      })}

      <SteerosNode cx={SX} cy={SY} r={R} mark={20} />
    </svg>
  );
}

export function RoutingMap() {
  return (
    <section aria-label="How Steeros routes">
      <div className="mx-auto max-w-[1200px] px-5 pb-10 md:px-8 md:pb-2">
        <div className="hidden md:block">
          <DesktopScene />
        </div>
        <div className="md:hidden">
          <MobileScene />
        </div>
      </div>
    </section>
  );
}
