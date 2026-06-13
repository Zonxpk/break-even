import { dailyDeckSeed, deckForToday, shufflePersonas } from '../deck';
import type { Persona } from '../../types/db';

const PERSONAS: Persona[] = [
  { id: 'a', name: 'A', bio: null, rarity: 'common', system_prompt: '', beats: [], brand_id: null, active: true },
  { id: 'b', name: 'B', bio: null, rarity: 'rare', system_prompt: '', beats: [], brand_id: null, active: true },
  { id: 'c', name: 'C', bio: null, rarity: 'legendary', system_prompt: '', beats: [], brand_id: null, active: true },
];

describe('daily deck', () => {
  test('seed stable per user and day', () => {
    expect(dailyDeckSeed('u1', '2026-06-12')).toBe(dailyDeckSeed('u1', '2026-06-12'));
    expect(dailyDeckSeed('u1', '2026-06-12')).not.toBe(dailyDeckSeed('u2', '2026-06-12'));
  });

  test('shuffle deterministic', () => {
    const a = shufflePersonas(PERSONAS, 42).map((p) => p.id);
    const b = shufflePersonas(PERSONAS, 42).map((p) => p.id);
    expect(a).toEqual(b);
  });

  test('caps legendary at one in deck', () => {
    const deck = deckForToday(PERSONAS, 'user', new Date('2026-06-12T10:00:00Z'));
    expect(deck.filter((p) => p.rarity === 'legendary').length).toBeLessThanOrEqual(1);
  });
});
