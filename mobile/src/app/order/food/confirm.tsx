import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { placeOrder } from '../../../api/orders';
import { cartLineTotal } from '../../../food/cartMath';
import { useFoodCart } from '../../../state/foodCart';
import { theme } from '../../../ui/theme';
import { PaperBackground } from '../../../ui/doodle/PaperBackground';
import { Sketch } from '../../../ui/doodle/Sketch';
import { CrayonCta } from '../../../ui/doodle/CrayonCta';
import { doodleHeader } from '../../../ui/doodle/nav';

export default function FoodConfirm() {
  const router = useRouter();
  const cart = useFoodCart();
  const lines = cart.lines;
  const [busy, setBusy] = useState(false);
  const subtotal = cart.subtotal();
  const deliveryFee = cart.deliveryFee;
  const displayTotal = subtotal + deliveryFee;

  const submit = async () => {
    if (lines.length === 0) return;
    setBusy(true);
    try {
      const order = await placeOrder({ service: 'food', items: cart.orderPayload() });
      cart.clear();
      router.replace(`/track/${order.id}`);
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
          {lines.map((line, li) => (
            <View key={line.lineId} style={[s.row, li > 0 && s.rowDivider]}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>
                  {line.name} × {line.quantity}
                </Text>
                {line.modifiers.map((m) => (
                  <Text key={`${m.groupId}-${m.optionId}`} style={s.sub}>
                    {m.optionName}
                  </Text>
                ))}
                {line.notes ? <Text style={s.sub}>{line.notes}</Text> : null}
              </View>
              <Text style={s.price}>฿{cartLineTotal(line).toFixed(0)}</Text>
            </View>
          ))}
          <View style={[s.row, s.rowDivider]}>
            <Text style={s.name}>รวม</Text>
            <Text style={s.strike}>฿{displayTotal.toFixed(0)}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.name}>ยอดชำระ (โปรเปิดตัว)</Text>
            <Text style={s.free}>฿0</Text>
          </View>
        </View>
      </Sketch>

      <Sketch style={s.note} fill={theme.doodle.paper2} stroke={theme.doodle.grape} dashed seed={42} radius={16}>
        <Text style={s.noteText}>* ทุกออเดอร์ฟรีตลอดไป เพราะเราไม่เคยส่งถึงใครเลย</Text>
      </Sketch>

      <CrayonCta
        label={busy ? 'กำลังหาไรเดอร์...' : 'สั่งเลย'}
        disabled={busy || lines.length === 0}
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
  cardInner: { paddingHorizontal: 13, paddingVertical: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, gap: 12 },
  rowDivider: { borderTopWidth: 2, borderTopColor: theme.doodle.grid, borderStyle: 'dotted' },
  name: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink },
  sub: { fontFamily: theme.font, fontSize: 12, color: theme.doodle.inkSoft, marginTop: 2 },
  price: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.coral },
  strike: { fontFamily: theme.font, fontSize: 15, color: theme.doodle.inkSoft, textDecorationLine: 'line-through' },
  free: { fontFamily: theme.fontBold, fontSize: 18, color: theme.doodle.coral },
  note: { marginTop: 14, transform: [{ rotate: '-0.5deg' }] },
  noteText: { fontFamily: theme.fontBold, fontSize: 13, color: theme.doodle.ink, lineHeight: 19, padding: 12 },
  cta: { marginTop: 20 },
});
