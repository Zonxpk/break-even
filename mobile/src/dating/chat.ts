import type { MatchRow, Persona, StoryBeat } from '../types/db';

const CANNED = [
  '555 ขำจังเลย 😂',
  'อืมมม น่าสนใจนะ',
  'เดี๋ยวตอบนะ กำลังขับรถ (หลงทาง)',
];

export function scriptedReply(persona: Persona, userText: string): string {
  const h = userText.length + persona.name.length;
  return `${persona.name}: ${CANNED[h % CANNED.length]}`;
}

export function nextBeat(match: MatchRow, persona: Persona): StoryBeat | null {
  const done = new Set(match.beats_done);
  return persona.beats.find((b) => match.affection >= b.at_affection && !done.has(b.id)) ?? null;
}

export function applyBeatChoice(beat: StoryBeat, choiceIndex: number): number {
  return beat.choices[choiceIndex]?.affection ?? 0;
}
