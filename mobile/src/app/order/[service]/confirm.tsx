import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { placeOrder } from '../../../api/orders';
import { SERVICE_CONFIGS } from '../../../services/config';
import { theme } from '../../../ui/theme';
import type { CatalogItem, Service } from '../../../types/db';

export default function Confirm() {
  const { service, items: itemsParam } = useLocalSearchParams<{ service: Service; items: string }>();
  const router = useRouter();
  const cfg = SERVICE_CONFIGS[service as Service];
  const items: CatalogItem[] = itemsParam ? JSON.parse(itemsParam) : [];
  const [busy, setBusy] = useState(false);

  if (!cfg) return null;
  const subtotal = items.reduce((sum, i) => sum + Number(i.price), 0);

  const submit = async () => {
    setBusy(true);
    try {
      const order = await placeOrder({ service: cfg.key, items });
      router.replace(`/track/${order.id}`);
    } catch {
      Alert.alert('ขออภัย', 'สั่งไม่สำเร็จ ลองใหม่อีกครั้ง');
      setBusy(false);
    }
  };

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: 'สรุปคำสั่งซื้อ' }} />
      {items.map((i) => (
        <View key={i.id} style={s.row}>
          <Text style={s.name}>{i.name}</Text>
          <Text style={s.price}>฿{Number(i.price).toFixed(0)}</Text>
        </View>
      ))}
      <View style={s.divider} />
      <View style={s.row}>
        <Text style={s.name}>รวม</Text>
        <Text style={s.strike}>฿{subtotal.toFixed(0)}</Text>
      </View>
      <View style={s.row}>
        <Text style={[s.name, { fontWeight: '800' }]}>ยอดชำระ (โปรเปิดตัว)</Text>
        <Text style={s.free}>฿0</Text>
      </View>
      <Text style={s.fine}>* ทุกออเดอร์ฟรีตลอดไป เพราะเราไม่เคยส่งถึงใครเลย</Text>
      <Pressable style={[s.cta, { backgroundColor: cfg.accent }, busy && { opacity: 0.5 }]} disabled={busy} onPress={submit}>
        <Text style={s.ctaText}>{busy ? 'กำลังหา' + cfg.trackingNoun + '...' : cfg.confirmCta}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  name: { fontSize: 15 },
  price: { fontSize: 15, color: theme.textMuted },
  strike: { fontSize: 15, color: theme.textMuted, textDecorationLine: 'line-through' },
  free: { fontSize: 18, fontWeight: '800', color: theme.green },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  fine: { fontSize: 11, color: '#bbb', marginTop: 4 },
  cta: { borderRadius: theme.radius, padding: 16, alignItems: 'center', marginTop: 24 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
