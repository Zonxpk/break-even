import { mulberry32 } from '../lib/rng';
import type { Persona } from '../types/db';

export function dailyDeckSeed(userId: string, dateStr: string): number {
  let h = 0;
  const s = `${userId}:${dateStr}`;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h >>> 0;
}

export function shufflePersonas(personas: Persona[], seed: number): Persona[] {
  const rng = mulberry32(seed);
  const arr = [...personas];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function deckForToday(personas: Persona[], userId: string, now = new Date()): Persona[] {
  const dateStr = now.toISOString().slice(0, 10);
  const shuffled = shufflePersonas(personas, dailyDeckSeed(userId, dateStr));
  const legendary = shuffled.filter((p) => p.rarity === 'legendary').slice(0, 1);
  const rest = shuffled.filter((p) => p.rarity !== 'legendary');
  return [...legendary, ...rest].slice(0, 10);
}
