import { mulberry32 } from '../lib/rng';
import type { GagAnchor, AnchorType } from '../types/db';
import type { GagScript } from './types';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Keyframe {
  f: number;
  pos: LatLng;
}

function dist2(a: LatLng, b: LatLng): number {
  const dx = (a.lng - b.lng) * Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  const dy = a.lat - b.lat;
  return dx * dx + dy * dy;
}

export function nearestAnchor(anchors: GagAnchor[], type: AnchorType | string, ref: LatLng): GagAnchor | null {
  const pool = anchors.filter((a) => a.type === type);
  if (pool.length === 0) return null;
  return pool.reduce((best, a) =>
    dist2({ lat: a.lat, lng: a.lng }, ref) < dist2({ lat: best.lat, lng: best.lng }, ref) ? a : best,
  );
}

function alongRoute(base: LatLng[], frac: number): LatLng {
  if (base.length === 0) return { lat: 0, lng: 0 };
  const idx = Math.min(base.length - 1, Math.max(0, frac) * (base.length - 1));
  const lo = Math.floor(idx);
  const hi = Math.min(base.length - 1, lo + 1);
  const t = idx - lo;
  return {
    lat: base[lo].lat + (base[hi].lat - base[lo].lat) * t,
    lng: base[lo].lng + (base[hi].lng - base[lo].lng) * t,
  };
}

export function buildDoomedPath(opts: {
  base: LatLng[];
  script: GagScript;
  anchors: GagAnchor[];
  seed: number;
}): Keyframe[] {
  const { base, script, anchors, seed } = opts;
  const rnd = mulberry32(seed);
  const frames: Keyframe[] = [{ f: 0, pos: base[0] ?? { lat: 13.7563, lng: 100.5018 } }];
  let routeProgress = 0;

  const timed = [...script.events].sort((a, b) => a.t - b.t);
  for (const ev of timed) {
    const f = Math.min(ev.t / script.duration_s, 1);
    if (ev.type === 'move') {
      if (ev.mode === 'route_to_user') {
        routeProgress = Math.min(routeProgress + 0.5 + rnd() * 0.2, 0.85);
        frames.push({ f: Math.min(f + 0.15, 0.98), pos: alongRoute(base, routeProgress) });
      } else {
        const off = alongRoute(base, routeProgress);
        frames.push({
          f: Math.min(f + 0.1, 0.98),
          pos: { lat: off.lat + (rnd() - 0.5) * 0.02, lng: off.lng + (rnd() - 0.5) * 0.02 },
        });
      }
    } else if (ev.type === 'incident' && ev.anchor) {
      const ref = frames[frames.length - 1].pos;
      const a = nearestAnchor(anchors, ev.anchor, ref);
      if (a) {
        frames.push({ f, pos: { lat: a.lat, lng: a.lng } });
        frames.push({ f: Math.min(f + 0.12, 0.99), pos: { lat: a.lat, lng: a.lng } });
      }
    } else if (ev.type === 'finale') {
      const ref = frames[frames.length - 1].pos;
      const a = ev.anchor ? nearestAnchor(anchors, ev.anchor, ref) : null;
      frames.push({ f: 1, pos: a ? { lat: a.lat, lng: a.lng } : ref });
    }
  }

  if (frames[frames.length - 1].f !== 1) frames.push({ f: 1, pos: frames[frames.length - 1].pos });
  return frames;
}

export function positionAt(path: Keyframe[], f: number): LatLng {
  const clamped = Math.min(Math.max(f, 0), 1);
  let prev = path[0];
  for (const kf of path) {
    if (kf.f >= clamped) {
      const span = kf.f - prev.f;
      const t = span === 0 ? 1 : (clamped - prev.f) / span;
      return {
        lat: prev.pos.lat + (kf.pos.lat - prev.pos.lat) * t,
        lng: prev.pos.lng + (kf.pos.lng - prev.pos.lng) * t,
      };
    }
    prev = kf;
  }
  return path[path.length - 1].pos;
}
