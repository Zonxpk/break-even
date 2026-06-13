import { mulberry32 } from '../../lib/rng';
import type { Persona } from '../../types/db';

function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i) | 0;
  return h >>> 0;
}

const CARD_COLORS = [
  '#FD297B',
  '#833AB4',
  '#00B14F',
  '#FF655B',
  '#1DA1F2',
  '#F59E0B',
  '#EC4899',
  '#6366F1',
] as const;

const EMOJI_BY_RARITY: Record<Persona['rarity'], string> = {
  common: '🙂',
  rare: '😎',
  legendary: '✨',
};

export function personaCardColor(personaId: string): string {
  const rand = mulberry32(seedFromId(personaId));
  return CARD_COLORS[Math.floor(rand() * CARD_COLORS.length)];
}

export function personaAge(personaId: string): number {
  return 21 + Math.floor(mulberry32(seedFromId(`${personaId}:age`))() * 12);
}

export function personaEmoji(persona: Persona): string {
  if (persona.name.includes('หมี')) return '🧸';
  if (persona.name.includes('ใบเตย') || persona.bio?.includes('ชานม')) return '🧋';
  if (persona.name.includes('ภูผา')) return '⚡';
  return EMOJI_BY_RARITY[persona.rarity];
}
