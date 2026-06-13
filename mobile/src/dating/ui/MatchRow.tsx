import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';

interface Props {
  name: string;
  affection: number;
  rarity?: string;
  onPress: () => void;
}

export default function MatchRow({ name, affection, rarity, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`แชทกับ ${name} ความชอบ ${affection} เปอร์เซ็นต์`}
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && s.cardPressed]}
    >
      <View style={s.avatar}>
        <Text style={s.avatarText}>💘</Text>
      </View>
      <View style={s.body}>
        <Text style={s.name} numberOfLines={1}>{name}</Text>
        <Text style={s.sub} numberOfLines={1}>
          {rarity ? `${rarity} · ` : ''}แตะเพื่อคุยต่อ
        </Text>
      </View>
      <View style={s.pill}>
        <Text style={s.pillText}>{affection}%</Text>
      </View>
      <Text style={s.chevron}>›</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bg,
    borderRadius: theme.radius,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 12,
  },
  cardPressed: { backgroundColor: theme.surface },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.dating.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22 },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 17, fontWeight: '800', color: theme.text },
  sub: { fontSize: 13, color: theme.textMuted },
  pill: {
    backgroundColor: theme.dating.userBubble,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillText: { fontSize: 13, fontWeight: '800', color: theme.greenDark },
  chevron: { fontSize: 22, color: theme.textMuted, fontWeight: '300' },
});
