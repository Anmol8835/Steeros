"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleWordmark: "Steeros" rasterized once into a dot grid, then
 * animated as a field of particles. At rest the word is a quiet ghost;
 * the pointer scatters nearby dots and a press punches a hole through
 * them, with each dot springing back to its cell so the word re-forms.
 *
 * The mesh reading is deliberate: the honeycomb mark is a routing mesh,
 * and here the letters are too. Canvas is fully decorative — aria-hidden,
 * with the name carried by the footer's legal line.
 */

const WORD = "Steeros";
/** Resting dot alpha on the black footer. */
const REST_ALPHA = 0.3;
const CELL_PX_DESKTOP = 4.5;
const CELL_PX_MOBILE = 3;
const DOT_RATIO = 0.5;

type FieldOptions = {
  cols: number;
  rows: number;
  cellSize: number;
  homes: number[];
  capacity: number;
  unit: number;
  maxDisplacement: number;
  radius: number;
  blast: { radiusScale: number; strength: number; jitter: number };
  rainPerSecond: number;
};

type Mask = {
  cols: number;
  rows: number;
  pitch: number;
  square: number;
  alpha: Float32Array;
  cells: number[];
};

/**
 * The particle engine, in device pixels. Homes hold each dot's target
 * cell; displaced dots are drawn in the accent color on top of the
 * rasterized base. Ported constants: a spring pulls a dot home, the
 * pointer repels within `radius`, and rain/blast dots fall under gravity.
 */
class ParticleField {
  readonly exitY: number;
  private readonly opts: FieldOptions;
  private readonly radius: number;
  private readonly occupied: Uint8Array;
  private readonly homes: number[];
  private readonly slot: Int32Array;
  private readonly px: Float32Array;
  private readonly py: Float32Array;
  private readonly vx: Float32Array;
  private readonly vy: Float32Array;
  private readonly cell: Int32Array;
  private readonly mode: Uint8Array;
  private readonly random = Math.random;

  private count = 0;
  private rainCarry = 0;
  private pointerIn = false;
  private mx = -Infinity;
  private my = -Infinity;
  private mvx = 0;
  private mvy = 0;
  private lastMove = 0;

  constructor(opts: FieldOptions) {
    this.opts = opts;
    this.radius = opts.radius;
    this.exitY = -4 * opts.unit;
    this.homes = opts.homes;

    const grid = opts.cols * opts.rows;
    this.occupied = new Uint8Array(grid);
    this.slot = new Int32Array(grid).fill(-1);
    for (const home of this.homes) this.occupied[home] = 1;

    this.px = new Float32Array(opts.capacity);
    this.py = new Float32Array(opts.capacity);
    this.vx = new Float32Array(opts.capacity);
    this.vy = new Float32Array(opts.capacity);
    this.cell = new Int32Array(opts.capacity);
    this.mode = new Uint8Array(opts.capacity);
  }

  pointerMove(x: number, y: number, now: number) {
    if (this.pointerIn) {
      const dt = Math.max((now - this.lastMove) / 1000, 0.004);
      this.mvx = 0.7 * this.mvx + ((x - this.mx) / dt) * 0.3;
      this.mvy = 0.7 * this.mvy + ((y - this.my) / dt) * 0.3;

      const intensity = Math.min(
        Math.hypot(this.mvx, this.mvy) / (700 * this.opts.unit),
        1,
      );
      const travel = Math.hypot(x - this.mx, y - this.my);
      const steps = Math.max(1, Math.ceil(travel / (0.5 * this.radius)));
      for (let i = 1; i <= steps; i++) {
        this.activateAround(
          this.mx + ((x - this.mx) * i) / steps,
          this.my + ((y - this.my) * i) / steps,
          this.mvx / 60,
          this.mvy / 60,
          intensity,
        );
      }
    }
    this.mx = x;
    this.my = y;
    this.lastMove = now;
    this.pointerIn = true;
  }

  pointerLeave() {
    this.pointerIn = false;
    this.mx = -Infinity;
    this.my = -Infinity;
  }

  /** Radial shove: every dot and home within reach is thrown outward. */
  blast(x: number, y: number) {
    const { cellSize, cols, rows, unit, blast } = this.opts;
    const reach = this.radius * blast.radiusScale;
    const reachSq = reach * reach;
    const minCol = Math.max(0, Math.floor((x - reach) / cellSize));
    const maxCol = Math.min(cols - 1, Math.ceil((x + reach) / cellSize));
    const minRow = Math.max(0, Math.floor((y - reach) / cellSize));
    const maxRow = Math.min(rows - 1, Math.ceil((y + reach) / cellSize));

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const dx = col * cellSize + cellSize / 2 - x;
        const dy = row * cellSize + cellSize / 2 - y;
        if (dx * dx + dy * dy <= reachSq) this.spawn(row * cols + col, 0, 0, 0);
      }
    }

    const jitter = blast.jitter * unit;
    const strength = blast.strength * unit;
    for (let i = 0; i < this.count; i++) {
      const dx = this.px[i] - x;
      const dy = this.py[i] - y;
      const distSq = dx * dx + dy * dy;
      if (distSq > reachSq) continue;
      const dist = Math.sqrt(distSq) || 1;
      const falloff = 1 - dist / reach;
      this.vx[i] +=
        (dx / dist) * strength * falloff +
        (this.random() - 0.5) * jitter * falloff;
      this.vy[i] +=
        (dy / dist) * strength * falloff +
        (this.random() - 0.5) * jitter * falloff;
    }
  }

  /** Ambient dots drifting up off random letters, then falling away. */
  rain(dt: number) {
    const { rainPerSecond, unit } = this.opts;
    if (this.homes.length === 0) return;
    this.rainCarry += dt * rainPerSecond;
    let drops = Math.floor(this.rainCarry);
    this.rainCarry -= drops;
    while (drops-- > 0) {
      const home = this.homes[(this.random() * this.homes.length) | 0];
      this.spawn(
        home,
        1,
        (this.random() - 0.5) * 8 * unit,
        -(8 + 18 * this.random()) * unit,
      );
    }
  }

  step(dt: number, now: number) {
    const { unit, maxDisplacement } = this.opts;

    if (now - this.lastMove > 50) {
      this.mvx *= 0.55;
      this.mvy *= 0.55;
      if (this.mvx * this.mvx + this.mvy * this.mvy < 25 * unit * unit) {
        this.mvx = 0;
        this.mvy = 0;
      }
    }

    const radius = this.radius;
    const radiusSq = radius * radius;
    const push = 4200 * unit;
    const gravity = 55 * unit;
    const terminal = 85 * unit;

    if (this.pointerIn) this.activateAround(this.mx, this.my, 0, 0, 0);

    for (let i = 0; i < this.count; i++) {
      let fx = 0;
      let fy = 0;

      if (this.pointerIn) {
        const dx = this.px[i] - this.mx;
        const dy = this.py[i] - this.my;
        const distSq = dx * dx + dy * dy;
        if (distSq < radiusSq) {
          const dist = Math.sqrt(distSq) || 1;
          const t = 1 - dist / radius;
          const falloff = t * t * (3 - 2 * t);
          const force = push * falloff * (1 / dist);
          fx += dx * force + 1.6 * this.mvx * falloff * 8;
          fy += dy * force + 1.6 * this.mvy * falloff * 8;
        }
      }

      if (this.mode[i] === 1) {
        fx -= 1.5 * this.vx[i];
        fy -= gravity;
        this.vx[i] += fx * dt;
        this.vy[i] += fy * dt;
        if (this.vy[i] < -terminal) this.vy[i] = -terminal;
        this.px[i] += this.vx[i] * dt;
        this.py[i] += this.vy[i] * dt;
        if (this.py[i] < this.exitY) {
          this.deactivate(i);
          i--;
        }
        continue;
      }

      const hx = this.homeX(i);
      const hy = this.homeY(i);
      fx += (hx - this.px[i]) * 110 - 11 * this.vx[i];
      fy += (hy - this.py[i]) * 110 - 11 * this.vy[i];
      this.vx[i] += fx * dt;
      this.vy[i] += fy * dt;
      this.px[i] += this.vx[i] * dt;
      this.py[i] += this.vy[i] * dt;

      let dx = this.px[i] - hx;
      let dy = this.py[i] - hy;
      const distSq = dx * dx + dy * dy;
      if (distSq > maxDisplacement * maxDisplacement) {
        const dist = Math.sqrt(distSq);
        this.px[i] = hx + (dx / dist) * maxDisplacement;
        this.py[i] = hy + (dy / dist) * maxDisplacement;
        const radial = (this.vx[i] * dx + this.vy[i] * dy) / dist;
        if (radial > 0) {
          this.vx[i] -= (dx / dist) * radial;
          this.vy[i] -= (dy / dist) * radial;
        }
        dx = this.px[i] - hx;
        dy = this.py[i] - hy;
      }

      if (dx * dx + dy * dy < 0.02 && this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i] < 1) {
        this.deactivate(i);
        i--;
      }
    }
  }

  /** Report dots that have left their cell: (cell, x, y, falling). */
  forEachDisplaced(
    visit: (cell: number, x: number, y: number, falling: boolean) => void,
  ) {
    for (let i = 0; i < this.count; i++) {
      const dx = this.px[i] - this.homeX(i);
      const dy = this.py[i] - this.homeY(i);
      if (dx * dx + dy * dy >= 0.64) {
        visit(this.cell[i], this.px[i], this.py[i], this.mode[i] === 1);
      }
    }
  }

  private homeX(i: number) {
    return (this.cell[i] % this.opts.cols) * this.opts.cellSize + this.opts.cellSize / 2;
  }

  private homeY(i: number) {
    return ((this.cell[i] / this.opts.cols) | 0) * this.opts.cellSize + this.opts.cellSize / 2;
  }

  private spawn(cell: number, mode: number, vx: number, vy: number) {
    if (
      !this.occupied[cell] ||
      this.slot[cell] !== -1 ||
      this.count >= this.opts.capacity
    ) {
      return -1;
    }
    const { cols, cellSize } = this.opts;
    const i = this.count++;
    this.slot[cell] = i;
    this.cell[i] = cell;
    this.mode[i] = mode;
    this.px[i] = (cell % cols) * cellSize + cellSize / 2;
    this.py[i] = ((cell / cols) | 0) * cellSize + cellSize / 2;
    this.vx[i] = vx;
    this.vy[i] = vy;
    return i;
  }

  /** Wake up every home inside the pointer disc. */
  private activateAround(
    x: number,
    y: number,
    vx: number,
    vy: number,
    intensity: number,
  ) {
    const { cellSize, cols, rows, unit } = this.opts;
    const radius = this.radius;
    const radiusSq = radius * radius;
    const kick = 3200 * unit * 0.55 * intensity;
    const minCol = Math.max(0, Math.floor((x - radius) / cellSize));
    const maxCol = Math.min(cols - 1, Math.ceil((x + radius) / cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / cellSize));
    const maxRow = Math.min(rows - 1, Math.ceil((y + radius) / cellSize));

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const dx = col * cellSize + cellSize / 2 - x;
        const dy = row * cellSize + cellSize / 2 - y;
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq) continue;
        const dist = Math.sqrt(distSq) || 1;
        const falloff = 1 - dist / radius;
        const eased = falloff * falloff * falloff;
        this.spawn(
          row * cols + col,
          0,
          (dx / dist) * ((kick * eased) / 60) + 1.6 * vx * eased,
          (dy / dist) * ((kick * eased) / 60) + 1.6 * vy * eased,
        );
      }
    }
  }

  private deactivate(i: number) {
    this.slot[this.cell[i]] = -1;
    const last = --this.count;
    if (i !== last) {
      this.px[i] = this.px[last];
      this.py[i] = this.py[last];
      this.vx[i] = this.vx[last];
      this.vy[i] = this.vy[last];
      this.cell[i] = this.cell[last];
      this.mode[i] = this.mode[last];
      this.slot[this.cell[i]] = i;
    }
  }
}

/**
 * Draw the word with the display serif, scale it to 97% of the strip
 * width, and sample the raster into square dot cells. Alpha fades toward
 * the bottom so the letters dissolve into the black rather than stopping
 * at a hard edge.
 */
function rasterize(
  width: number,
  height: number,
  cssWidth: number,
  dpr: number,
  family: string,
): Mask | null {
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;

  try {
    const ctx = off.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    const setFont = (size: number) => {
      ctx.font = `400 ${size}px ${family}`;
      const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
      if ("letterSpacing" in spaced) spaced.letterSpacing = `${-0.03 * size}px`;
    };

    setFont(0.3 * width);
    const natural = ctx.measureText(WORD).width;
    setFont((0.3 * width * (0.97 * width)) / natural);

    const metrics = ctx.measureText(WORD);
    const ascent = metrics.actualBoundingBoxAscent;
    const glyphHeight = ascent + metrics.actualBoundingBoxDescent;
    const top = 0.03 * width;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#fff";
    ctx.fillText(WORD, width / 2, top + ascent);

    const pixels = ctx.getImageData(0, 0, width, height).data;
    const cellCss = cssWidth < 640 ? CELL_PX_MOBILE : CELL_PX_DESKTOP;
    const pitch = Math.max(1, Math.round(cellCss * dpr));
    const square = Math.max(1, Math.round(cellCss * DOT_RATIO * dpr));
    const cols = Math.ceil(width / pitch);
    const rows = Math.ceil(height / pitch);
    const alpha = new Float32Array(cols * rows);
    const cells: number[] = [];

    // Fixed-seed noise keeps the dissolve pattern stable across rebuilds.
    let seed = 0x135283b;
    const random = () => {
      seed = (1664525 * seed + 0x3c6ef35f) >>> 0;
      return seed / 0x100000000;
    };

    const fadeStart = top + 0.12 * glyphHeight;
    const fadeEnd = top + 1.02 * glyphHeight;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = Math.min(width - 1, col * pitch + (pitch >> 1));
        const y = Math.min(height - 1, row * pitch + (pitch >> 1));
        if (pixels[(y * width + x) * 4 + 3] <= 120 || random() > 0.8) continue;

        const t = Math.min(1, Math.max(0, (y - fadeStart) / (fadeEnd - fadeStart)));
        const smooth = t * t * (3 - 2 * t);
        if (smooth > 0.95 || random() < 0.45 * smooth) continue;

        const cell = row * cols + col;
        alpha[cell] = Math.min(1, Math.max(0.12, 1 - 0.85 * smooth + (random() - 0.5) * 0.09));
        cells.push(cell);
      }
    }

    return { cols, rows, pitch, square, alpha, cells };
  } finally {
    off.width = 0;
    off.height = 0;
  }
}

export function ParticleWordmark({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let disposed = false;
    let generation = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let teardown: (() => void) | null = null;

    const build = async () => {
      const gen = ++generation;
      teardown?.();
      teardown = null;

      if (host.getBoundingClientRect().width < 80) return;

      const family =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--font-hedvig-serif")
          .trim() || "Georgia, serif";
      try {
        await document.fonts.load(`400 64px ${family}`);
      } catch {
        // Canvas falls back to the generic serif if the face never loads.
      }
      await document.fonts.ready;
      if (disposed || gen !== generation) return;

      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);
      if (width < 80 || height < 24 || width * height > 16_000_000) return;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const mask = rasterize(width, height, rect.width, dpr, family);
      if (!mask || mask.cells.length === 0) return;

      const accent =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--burgundy-on-ink")
          .trim() || "#e7a9b3";

      const base = document.createElement("canvas");
      base.width = width;
      base.height = height;
      const baseCtx = base.getContext("2d");
      if (!baseCtx) return;

      baseCtx.fillStyle = "#fff";
      const inset = (mask.pitch - mask.square) / 2;
      for (const cell of mask.cells) {
        baseCtx.globalAlpha = REST_ALPHA * mask.alpha[cell];
        baseCtx.fillRect(
          (cell % mask.cols) * mask.pitch + inset,
          ((cell / mask.cols) | 0) * mask.pitch + inset,
          mask.square,
          mask.square,
        );
      }
      baseCtx.globalAlpha = 1;
      ctx.drawImage(base, 0, 0);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const field = new ParticleField({
        cols: mask.cols,
        rows: mask.rows,
        cellSize: mask.pitch,
        homes: mask.cells,
        capacity: 60_000,
        unit: dpr,
        maxDisplacement: 28 * dpr,
        radius: 90 * dpr,
        blast: { radiusScale: 6, strength: 800, jitter: 120 },
        rainPerSecond: 28,
      });

      const abort = new AbortController();
      const { signal } = abort;
      const toLocal = (clientX: number, clientY: number) => {
        const r = canvas.getBoundingClientRect();
        return [(clientX - r.left) * dpr, (clientY - r.top) * dpr] as const;
      };

      window.addEventListener(
        "pointermove",
        (e) => {
          const [x, y] = toLocal(e.clientX, e.clientY);
          field.pointerMove(x, y, performance.now());
        },
        { passive: true, signal },
      );
      document.documentElement.addEventListener(
        "mouseleave",
        () => field.pointerLeave(),
        { signal },
      );
      host.addEventListener(
        "pointerdown",
        (e) => {
          const [x, y] = toLocal(e.clientX, e.clientY);
          field.blast(x, y);
        },
        { signal },
      );

      let frame = 0;
      let visible = false;
      let last = performance.now();

      const draw = () => {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(base, 0, 0);
        field.forEachDisplaced((cell, x, y, falling) => {
          const col = cell % mask.cols;
          const row = (cell / mask.cols) | 0;
          ctx.clearRect(col * mask.pitch, row * mask.pitch, mask.pitch, mask.pitch);
          ctx.fillStyle = accent;
          ctx.globalAlpha = falling
            ? Math.min(1, 0.85 * mask.alpha[cell] + 0.2)
            : Math.min(1, 0.7 * mask.alpha[cell] + 0.15);
          ctx.fillRect(
            x - mask.square / 2,
            y - mask.square / 2,
            mask.square,
            mask.square,
          );
        });
        ctx.globalAlpha = 1;
      };

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        field.rain(dt);
        field.step(dt, now);
        draw();
        frame = visible ? requestAnimationFrame(tick) : 0;
      };

      const observer = new IntersectionObserver(([entry]) => {
        const inView = !!entry?.isIntersecting;
        if (inView === visible) return;
        visible = inView;
        if (visible) {
          last = performance.now();
          if (!frame) frame = requestAnimationFrame(tick);
        } else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      });
      observer.observe(canvas);

      teardown = () => {
        abort.abort();
        observer.disconnect();
        cancelAnimationFrame(frame);
        base.width = 0;
        base.height = 0;
        canvas.width = 0;
        canvas.height = 0;
      };
    };

    const resize = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void build(), 140);
    });
    resize.observe(host);
    void build();

    return () => {
      disposed = true;
      generation++;
      if (timer) clearTimeout(timer);
      resize.disconnect();
      teardown?.();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`relative aspect-[100/25] w-full overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
    </div>
  );
}
