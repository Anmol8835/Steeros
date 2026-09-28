/**
 * Steeros brand mark: the five-cell honeycomb — a routing mesh.
 * Fills with currentColor so it inherits the surrounding text tone
 * (ink in the nav). Decorative; the wordmark carries the name.
 *
 * Pass x/y/width/height when nesting inside another <svg> scene.
 */
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
      viewBox="0 0 186 170"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      x={x}
      y={y}
      width={width}
      height={height}
    >
      <polygon points="91,10 118,25 118,52 91,67 64,52 64,25" />
      <polygon points="43,47 70,62 70,89 43,104 16,89 16,62" />
      <polygon points="139,47 166,62 166,89 139,104 112,89 112,62" />
      <polygon points="62,98 89,113 89,141 62,156 35,141 35,113" />
      <polygon points="120,98 147,113 147,141 120,156 93,141 93,113" />
    </svg>
  );
}
