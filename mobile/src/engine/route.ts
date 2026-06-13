import { mulberry32 } from '../lib/rng';
import type { LatLng } from './path';

const OSRM = 'https://router.project-osrm.org/route/v1/driving';

export async function fetchRoute(from: LatLng, to: LatLng, seed = 1): Promise<LatLng[]> {
  try {
    const res = await fetch(
      `${OSRM}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`,
    );
    if (!res.ok) throw new Error(`osrm ${('status' in res && (res as Response).status) || 'error'}`);
    const j = await res.json();
    const coords: [number, number][] = j.routes[0].geometry.coordinates;
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return fallbackRoute(from, to, seed);
  }
}

export function fallbackRoute(from: LatLng, to: LatLng, seed: number): LatLng[] {
  const rnd = mulberry32(seed);
  const points: LatLng[] = [from];
  const STEPS = 8;
  for (let i = 1; i < STEPS; i++) {
    const t = i / STEPS;
    points.push({
      lat: from.lat + (to.lat - from.lat) * t + (rnd() - 0.5) * 0.006,
      lng: from.lng + (to.lng - from.lng) * t + (rnd() - 0.5) * 0.006,
    });
  }
  points.push(to);
  return points;
}
