import { applyBeatChoice, nextBeat } from '../chat';
import type { MatchRow, Persona } from '../../types/db';

const persona: Persona = {
  id: 'p1',
  name: 'Test',
  bio: null,
  rarity: 'common',
  system_prompt: '',
  brand_id: null,
  active: true,
  beats: [
    { id: 'b1', at_affection: 8, scene: 's1', choices: [{ text: 'a', affection: 5 }, { text: 'b', affection: -2 }] },
    { id: 'b2', at_affection: 15, scene: 's2', choices: [{ text: 'c', affection: 3 }] },
    { id: 'b3', at_affection: 22, scene: 's3', choices: [{ text: 'd', affection: 7 }] },
  ],
};

function match(affection: number, beats_done: string[] = []): MatchRow {
  return {
    id: 'm1',
    user_id: 'u1',
    persona_id: 'p1',
    affection,
    beats_done,
    created_at: '',
  };
}

test('nextBeat returns first incomplete beat whose threshold is met', () => {
  expect(nextBeat(match(5), persona)).toBeNull();
  expect(nextBeat(match(8), persona)?.id).toBe('b1');
  expect(nextBeat(match(15), persona)?.id).toBe('b1');
  expect(nextBeat(match(15, ['b1']), persona)?.id).toBe('b2');
});

test('nextBeat skips completed beats', () => {
  expect(nextBeat(match(20, ['b1']), persona)?.id).toBe('b2');
  expect(nextBeat(match(20, ['b1', 'b2']), persona)).toBeNull();
  expect(nextBeat(match(22, ['b1', 'b2']), persona)?.id).toBe('b3');
  expect(nextBeat(match(30, ['b1', 'b2', 'b3']), persona)).toBeNull();
});

test('applyBeatChoice returns affection delta', () => {
  const beat = persona.beats[0];
  expect(applyBeatChoice(beat, 0)).toBe(5);
  expect(applyBeatChoice(beat, 1)).toBe(-2);
  expect(applyBeatChoice(beat, 99)).toBe(0);
});
