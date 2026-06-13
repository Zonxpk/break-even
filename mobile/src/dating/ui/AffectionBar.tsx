import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';

interface Props {
  affection: number;
  name?: string;
}

export default function AffectionBar({ affection, name }: Props) {
  const pct = Math.min(100, Math.max(0, affection));
  return (
    <View style={s.wrap} accessibilityLabel={`ความชอบ ${pct} เปอร์เซ็นต์`}>
      {name ? <Text style={s.name} numberOfLines={1}>{name}</Text> : null}
      <View style={s.row}>
        <Text style={s.label}>ความชอบ</Text>
        <Text style={s.value}>{pct}%</Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct}%` }]} />
      </View>
      {pct < 30 ? (
        <Text style={s.hint}>คุยต่ออีกนิด แล้วค่อยนัด (ต้อง 30%)</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    padding: theme.pad,
    backgroundColor: theme.bg,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    gap: 6,
  },
  name: { fontSize: 13, color: theme.textMuted, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontWeight: '700', fontSize: 15, color: theme.text },
  value: { fontWeight: '800', fontSize: 15, color: theme.greenDark },
  track: { height: 8, backgroundColor: theme.surface, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.green, borderRadius: 4 },
  hint: { fontSize: 12, color: theme.textMuted },
});
