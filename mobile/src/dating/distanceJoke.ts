import { mulberry32 } from '../lib/rng';

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = Math.imul(31, h) + input.charCodeAt(i) | 0;
  return h >>> 0;
}

function formatKm(seed: number): string {
  const km = 0.5 + mulberry32(seed)() * 2.5;
  return `${km.toFixed(1)} กม. (โกหก)`;
}

export function fakeDistanceKm(personaId: string, dateStr: string): string {
  return formatKm(hashSeed(`${personaId}:${dateStr}`));
}

export function anchorDistanceKm(personaId: string, anchorId: string): string {
  return formatKm(hashSeed(`${personaId}:${anchorId}`));
}
