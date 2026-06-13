import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { listMatches } from '../../api/personas';
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
        ListEmptyComponent={<Text style={s.empty}>ยังไม่มีแมตช์ — ไปปัดการ์ดกัน</Text>}
        renderItem={({ item }) => (
          <Pressable style={s.card} onPress={() => router.push(`/dating/chat/${item.id}`)}>
            <Text style={s.name}>{item.personas?.name ?? '???'}</Text>
            <Text style={s.affection}>ความชอบ {item.affection}%</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  empty: { textAlign: 'center', color: theme.textMuted, marginTop: 60 },
  card: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 16, marginBottom: 10 },
  name: { fontSize: 17, fontWeight: '800' },
  affection: { color: theme.textMuted, marginTop: 4 },
});
