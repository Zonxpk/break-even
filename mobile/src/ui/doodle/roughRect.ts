/**
 * Hand-drawn ("doodle") rounded-rectangle path generator.
 *
 * react-native-svg cannot apply CSS-style feTurbulence/feDisplacementMap wobble
 * to native Views the way the `prototypes/doodle.html` prototype does. Instead we
 * reproduce the look directly: a rounded-rect outline whose edge points are
 * perturbed by a *seeded* PRNG, so every card gets a stable, organic wobble.
 *
 * Returns an SVG path `d` string. Deterministic for a given (w, h, seed).
 */

export type RoughRectOpts = {
  /** corner radius in px (single value; corners are jittered anyway) */
  radius?: number;
  /** seed → stable wobble per element */
  seed?: number;
  /** max perpendicular jitter in px */
  wobble?: number;
};

// mulberry32 — tiny deterministic PRNG
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function roughRect(w: number, h: number, opts: RoughRectOpts = {}): string {
  const r = Math.max(0, Math.min(opts.radius ?? 16, Math.min(w, h) / 2));
  const wob = opts.wobble ?? 2.4;
  const rand = rng(opts.seed ?? 1);
  const j = () => (rand() - 0.5) * 2 * wob; // [-wob, +wob]

  // Points are jittered ONLY perpendicular to their (axis-aligned) edge — never
  // along it. Tangential jitter is what lets adjacent points slide toward each
  // other and turn a gentle bump into a sharp spike. We also fade the jitter out
  // as the straight run shrinks, so short/collapsed edges (pills, squat buttons
  // where the radius eats the whole edge) stay smooth instead of spiking.
  const FADE = 22;
  const hLen = Math.max(0, w - 2 * r); // top/bottom straight run
  const vLen = Math.max(0, h - 2 * r); // left/right straight run
  const hs = Math.min(1, hLen / FADE);
  const vs = Math.min(1, vLen / FADE);
  const f = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const hp = (x: number, y: number) => f(x, y + j() * hs); // horizontal edge → move y only
  const vp = (x: number, y: number) => f(x + j() * vs, y); // vertical edge → move x only
  // corner: gentle control-point jitter; endpoint left clean so joins stay smooth
  const c = (cx: number, cy: number, x: number, y: number) =>
    `Q${(cx + j() * 0.5).toFixed(2)},${(cy + j() * 0.5).toFixed(2)} ${f(x, y)}`;

  const midX = w / 2;
  const midY = h / 2;
  // walk the perimeter clockwise; midpoint only on edges long enough to carry one
  return [
    `M${f(r, 0)}`,
    hLen >= 12 ? `L${hp(midX, 0)}` : '',
    `L${hp(w - r, 0)}`,
    c(w, 0, w, r),
    vLen >= 12 ? `L${vp(w, midY)}` : '',
    `L${vp(w, h - r)}`,
    c(w, h, w - r, h),
    hLen >= 12 ? `L${hp(midX, h)}` : '',
    `L${hp(r, h)}`,
    c(0, h, 0, h - r),
    vLen >= 12 ? `L${vp(0, midY)}` : '',
    `L${vp(0, r)}`,
    c(0, 0, r, 0),
    'Z',
  ].filter(Boolean).join(' ');
}

// ponytail: one runnable self-check; `node --loader ts-node` not needed — run via tsx/ts-node if desired.
export function demo() {
  const a = roughRect(100, 60, { seed: 7 });
  const b = roughRect(100, 60, { seed: 7 });
  const cc = roughRect(100, 60, { seed: 8 });
  console.assert(a.startsWith('M') && a.endsWith('Z'), 'path is closed');
  console.assert(a.includes('Q'), 'has rounded corners');
  console.assert(a === b, 'deterministic for same seed');
  console.assert(a !== cc, 'differs across seeds');
  console.assert(!a.includes('NaN'), 'no NaN coords');
  // pill: h == 2r, vertical edges collapse → no jittered midpoints on the ends,
  // so the rounded caps stay smooth (spike regression guard)
  const pill = roughRect(120, 40, { radius: 20, seed: 3 });
  console.assert(!pill.includes('NaN'), 'pill: no NaN coords');
  console.assert((pill.match(/Q/g) || []).length === 4, 'pill: 4 clean corners');
  return 'roughRect ok';
}
