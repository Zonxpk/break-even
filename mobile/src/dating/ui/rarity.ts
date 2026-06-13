import { theme } from '../../ui/theme';
import type { PersonaRarity } from '../../types/db';

export interface RarityStyle {
  badge: object;
  badgeText: object;
  card?: object;
  namePrefix?: string;
  label: string;
}

export const RARITY_STYLE: Record<PersonaRarity, RarityStyle> = {
  common: {
    badge: { backgroundColor: theme.surface },
    badgeText: { color: theme.textMuted },
    label: 'ทั่วไป',
  },
  rare: {
    badge: { backgroundColor: theme.dating.rareBg },
    badgeText: { color: theme.dating.rareText },
    label: 'หายาก',
  },
  legendary: {
    badge: { backgroundColor: theme.dating.rareBg },
    badgeText: { color: theme.dating.rareText },
    card: { borderWidth: 2, borderColor: theme.gold },
    namePrefix: '✨ ',
    label: 'ตำนาน',
  },
};
