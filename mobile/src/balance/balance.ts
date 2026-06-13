import type { Tier } from '../types/db';

export const XP = {
  order_failed: 25,
  date_ghosted: 40,
  story_beat: 10,
  daily_checkin: 5,
  swipe_rejected: 2,
} as const;

export const TIERS: ReadonlyArray<{ tier: Tier; minXp: number }> = [
  { tier: 'silver', minXp: 0 },
  { tier: 'gold', minXp: 200 },
  { tier: 'platinum', minXp: 600 },
  { tier: 'vip', minXp: 1500 },
];

export type Rarity = 'common' | 'rare' | 'legendary';

export const MATCH_BASE: Record<Rarity, number> = { common: 0.7, rare: 0.25, legendary: 0.03 };
export const TIER_MATCH_MULT: Record<Tier, number> = { silver: 1, gold: 1.3, platinum: 1.7, vip: 2.2 };
export const MATCH_CAP: Record<Rarity, number> = { common: 0.95, rare: 0.6, legendary: 0.3 };

export function tierForXp(xp: number): Tier {
  let current: Tier = 'silver';
  for (const t of TIERS) if (xp >= t.minXp) current = t.tier;
  return current;
}

export function matchChance(tier: Tier, rarity: Rarity): number {
  return Math.min(MATCH_BASE[rarity] * TIER_MATCH_MULT[tier], MATCH_CAP[rarity]);
}
