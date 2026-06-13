import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { listMatches } from '../../api/personas';
import MatchRow from '../../dating/ui/MatchRow';
import { RARITY_STYLE } from '../../dating/ui/rarity';
import { theme } from '../../ui/theme';

type Row = Awaited<ReturnType<typeof listMatches>>[number];

export default function DatingMatches() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);

  useFocusEffect(useCallback(() => {
    listMatches().then(setRows).catch(() => {});
  }, []));

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: 'แมตช์ของฉัน' }} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={rows.length === 0 ? s.emptyList : undefined}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>💔</Text>
            <Text style={s.empty}>ยังไม่มีแมตช์</Text>
            <Text style={s.emptySub}>ไปปัดการ์ดกัน — วันนี้มีคนใหม่มาให้ผิดหวัง</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MatchRow
            name={item.personas?.name ?? '???'}
            affection={item.affection}
            rarity={item.personas ? RARITY_STYLE[item.personas.rarity].label : undefined}
            onPress={() => router.push(`/dating/chat/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', gap: 8, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48 },
  empty: { textAlign: 'center', fontSize: 18, fontWeight: '800', color: theme.text },
  emptySub: { textAlign: 'center', color: theme.textMuted, lineHeight: 20 },
});
