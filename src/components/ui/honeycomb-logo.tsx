/**
 * Steeros brand mark: the five-cell honeycomb — a routing mesh.
 * Five regular pointy-top hexagons: one top cell, a wide middle pair,
 * and a closer bottom pair, all symmetric about the vertical axis.
 * Fills with currentColor so it inherits the surrounding text tone
 * (ink in the nav). Decorative: it carries no name of its own, so a
 * link with no other content needs its own aria-label.
 *
 * Pass x/y/width/height when nesting inside another <svg> scene.
 */

/** Cell circumradius: each cell is 2R tall and √3·R wide. */
const R = 118.25;
/** Cell half-width, √3/2·R. */
const A = (Math.sqrt(3) / 2) * R;

/** Cell centers relative to the top cell. */
const CELLS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], // top
  [-181.5, 144], // middle left
  [181.5, 144], // middle right
  [-110, 358], // bottom left
  [110, 358], // bottom right
];

/** viewBox height ÷ width, for callers that slot the mark by width. */
export const HONEYCOMB_ASPECT = 615 / 588;

/** Half-away-from-zero, so mirrored cells round to mirrored points. */
const round = (v: number) => (Math.sign(v) * Math.round(Math.abs(v) * 100)) / 100;

/** Pointy-top hexagon around a center, starting at the top vertex. */
function hexPoints(cx: number, cy: number): string {
  return [
    [cx, cy - R],
    [cx + A, cy - R / 2],
    [cx + A, cy + R / 2],
    [cx, cy + R],
    [cx - A, cy + R / 2],
    [cx - A, cy - R / 2],
  ]
    .map(([x, y]) => `${round(x)},${round(y)}`)
    .join(" ");
}

export function HoneycombLogo({
  className,
  x,
  y,
  width,
  height,
}: {
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-294 -128.5 588 615"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      x={x}
      y={y}
      width={width}
      height={height}
    >
      {CELLS.map(([cx, cy]) => (
        <polygon key={`${cx},${cy}`} points={hexPoints(cx, cy)} />
      ))}
    </svg>
  );
}
