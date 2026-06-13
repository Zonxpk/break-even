import { View, Text, StyleSheet } from 'react-native';
import type { Persona } from '../../types/db';
import { theme } from '../../ui/theme';
import { personaAge, personaCardColor, personaEmoji } from './personaVisual';

interface Props {
  persona: Persona;
  distanceLabel: string;
}

export default function TinderCard({ persona, distanceLabel }: Props) {
  const color = personaCardColor(persona.id);
  const age = personaAge(persona.id);
  const emoji = personaEmoji(persona);

  return (
    <View style={s.card}>
      <View style={[s.photo, { backgroundColor: color }]}>
        <Text style={s.emoji}>{emoji}</Text>
      </View>
      <View style={s.footer}>
        <View style={s.footerFade} />
        <View style={s.meta}>
          <Text style={s.name}>
            {persona.name} <Text style={s.age}>{age}</Text>
          </Text>
          <Text style={s.distance}>📍 {distanceLabel}</Text>
          {persona.bio ? (
            <Text style={s.bio} numberOfLines={2}>{persona.bio}</Text>
          ) : null}
          {persona.rarity !== 'common' ? (
            <Text style={s.rarityBadge}>
              {persona.rarity === 'legendary' ? '✨ ตำนาน' : '⭐ หายาก'}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.bg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  photo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  emoji: { fontSize: 96 },
  footer: { position: 'relative' },
  footerFade: {
    position: 'absolute',
    top: -80,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  meta: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 4,
  },
  name: { fontSize: 28, fontWeight: '800', color: '#fff' },
  age: { fontWeight: '400' },
  distance: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  bio: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginTop: 4 },
  rarityBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
