import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { placeOrder } from '../../../api/orders';
import { SERVICE_CONFIGS } from '../../../services/config';
import { theme } from '../../../ui/theme';
import { PaperBackground } from '../../../ui/doodle/PaperBackground';
import { Sketch } from '../../../ui/doodle/Sketch';
import { CrayonCta } from '../../../ui/doodle/CrayonCta';
import { doodleHeader } from '../../../ui/doodle/nav';
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
      // Drop the browse→confirm stack so back from track goes home, not a stale order screen.
      if (router.canDismiss()) router.dismissAll();
      router.push(`/track/${order.id}`);
    } catch {
      Alert.alert('ขออภัย', 'สั่งไม่สำเร็จ ลองใหม่อีกครั้ง');
      setBusy(false);
    }
  };

  return (
    <View style={s.root}>
      <PaperBackground />
      <Stack.Screen options={{ ...doodleHeader, title: 'สรุปคำสั่งซื้อ' }} />

      <Sketch style={s.card} fill={theme.doodle.card} seed={5} radius={18}>
        <View style={s.cardInner}>
          {items.map((i, idx) => (
            <View key={i.id} style={[s.row, idx > 0 && s.rowDivider]}>
              <Text style={s.name}>{i.name}</Text>
              <Text style={s.price}>฿{Number(i.price).toFixed(0)}</Text>
            </View>
          ))}
          <View style={[s.row, s.rowDivider]}>
            <Text style={s.name}>รวม</Text>
            <Text style={s.strike}>฿{subtotal.toFixed(0)}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.nameBold}>ยอดชำระ (โปรเปิดตัว)</Text>
            <Text style={s.free}>฿0</Text>
          </View>
        </View>
      </Sketch>

      <Sketch style={s.note} fill={theme.doodle.paper2} stroke={theme.doodle.grape} dashed seed={42} radius={16}>
        <Text style={s.noteText}>* ทุกออเดอร์ฟรีตลอดไป เพราะเราไม่เคยส่งถึงใครเลย</Text>
      </Sketch>

      <CrayonCta
        label={busy ? 'กำลังหา' + cfg.trackingNoun + '...' : cfg.confirmCta}
        disabled={busy}
        seed={99}
        style={s.cta}
        onPress={submit}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper, padding: theme.pad },
  card: { transform: [{ rotate: '-0.4deg' }] },
  cardInner: { padding: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, gap: 12 },
  rowDivider: { borderTopWidth: 2, borderTopColor: theme.doodle.grid, borderStyle: 'dotted' },
  name: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink, flex: 1 },
  nameBold: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink, flex: 1 },
  price: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.coral },
  strike: { fontFamily: theme.font, fontSize: 15, color: theme.doodle.inkSoft, textDecorationLine: 'line-through' },
  free: { fontFamily: theme.fontBold, fontSize: 18, color: theme.doodle.coral },
  note: { marginTop: 14, transform: [{ rotate: '-0.5deg' }] },
  noteText: { fontFamily: theme.fontBold, fontSize: 13, color: theme.doodle.ink, lineHeight: 19, padding: 12 },
  cta: { marginTop: 20 },
});
