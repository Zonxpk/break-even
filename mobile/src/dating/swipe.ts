import { mulberry32 } from '../lib/rng';
import { matchChance, type Rarity } from '../balance/balance';
import type { Tier } from '../types/db';

export type SwipeResult = 'match' | 'reject';

export function resolveSwipe(opts: { tier: Tier; rarity: Rarity; seed: number }): SwipeResult {
  const chance = matchChance(opts.tier, opts.rarity);
  const roll = mulberry32(opts.seed)();
  return roll < chance ? 'match' : 'reject';
}
