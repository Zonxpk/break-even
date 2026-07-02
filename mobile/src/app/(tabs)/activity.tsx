import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { listOrders } from '../../api/orders';
import { SERVICE_CONFIGS } from '../../services/config';
import { theme } from '../../ui/theme';
import { PaperBackground } from '../../ui/doodle/PaperBackground';
import { Sketch } from '../../ui/doodle/Sketch';
import type { OrderRow, Service } from '../../types/db';

export default function Activity() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const router = useRouter();

  useFocusEffect(useCallback(() => { listOrders().then(setOrders).catch(() => {}); }, []));

  return (
    <View style={s.root}>
      <PaperBackground />
      <Text style={s.title}>กิจกรรมของฉัน</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>ยังไม่เคยสั่งอะไรเลย ความผิดหวังรอคุณอยู่</Text>}
        renderItem={({ item, index }) => {
          const cfg = SERVICE_CONFIGS[item.service as Service];
          const tracking = item.status === 'tracking';
          return (
            <Pressable onPress={() => tracking && router.push(`/track/${item.id}`)}>
              <Sketch style={s.card} fill={theme.doodle.card} seed={index + 1} radius={18}>
                <View style={s.cardInner}>
                  <Text style={s.svc}>{cfg?.title ?? item.service}</Text>
                  <Text style={s.when}>{new Date(item.created_at).toLocaleString('th-TH')}</Text>
                  <Text style={[s.status, tracking ? s.tracking : s.failed]}>
                    {tracking ? '🛵 กำลังเดินทาง (มั้ง) — แตะเพื่อติดตาม' :
                     item.status === 'failed_hilariously' ? '🛶 ไปไม่ถึง (ตามคาด)' : 'ยกเลิก'}
                  </Text>
                </View>
              </Sketch>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper, padding: theme.pad },
  title: { fontFamily: theme.fontBold, fontSize: 22, color: theme.doodle.ink, marginTop: 40, marginBottom: 14 },
  list: { paddingBottom: 24 },
  empty: { fontFamily: theme.font, color: theme.doodle.inkSoft, textAlign: 'center', marginTop: 60 },
  card: { marginBottom: 10 },
  cardInner: { padding: 14, gap: 2 },
  svc: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink },
  when: { fontFamily: theme.font, color: theme.doodle.inkSoft, fontSize: 12 },
  status: { fontFamily: theme.fontBold, fontSize: 13, marginTop: 4 },
  tracking: { color: theme.doodle.coral },
  failed: { color: theme.doodle.inkSoft },
});
