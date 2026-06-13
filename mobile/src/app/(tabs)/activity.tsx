import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { listOrders } from '../../api/orders';
import { SERVICE_CONFIGS } from '../../services/config';
import { theme } from '../../ui/theme';
import type { OrderRow, Service } from '../../types/db';

export default function Activity() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const router = useRouter();

  useFocusEffect(useCallback(() => { listOrders().then(setOrders).catch(() => {}); }, []));

  return (
    <View style={s.root}>
      <Text style={s.title}>กิจกรรมของฉัน</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        ListEmptyComponent={<Text style={s.empty}>ยังไม่เคยสั่งอะไรเลย ความผิดหวังรอคุณอยู่</Text>}
        renderItem={({ item }) => {
          const cfg = SERVICE_CONFIGS[item.service as Service];
          return (
            <Pressable
              style={s.card}
              onPress={() => item.status === 'tracking' && router.push(`/track/${item.id}`)}
            >
              <Text style={s.svc}>{cfg?.title ?? item.service}</Text>
              <Text style={s.when}>{new Date(item.created_at).toLocaleString('th-TH')}</Text>
              <Text style={[s.status, item.status === 'tracking' ? s.tracking : s.failed]}>
                {item.status === 'tracking' ? '🛵 กำลังเดินทาง (มั้ง) — แตะเพื่อติดตาม' :
                 item.status === 'failed_hilariously' ? '🛶 ไปไม่ถึง (ตามคาด)' : 'ยกเลิก'}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  title: { fontSize: 22, fontWeight: '800', marginTop: 40, marginBottom: 14 },
  empty: { color: theme.textMuted, textAlign: 'center', marginTop: 60 },
  card: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 14, marginBottom: 10, gap: 2 },
  svc: { fontWeight: '700', fontSize: 15 },
  when: { color: theme.textMuted, fontSize: 12 },
  status: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  tracking: { color: theme.green },
  failed: { color: theme.textMuted },
});
