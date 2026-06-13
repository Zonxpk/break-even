import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { placeOrder } from '../../../api/orders';
import { cartLineTotal } from '../../../food/cartMath';
import { useFoodCart } from '../../../state/foodCart';
import { theme } from '../../../ui/theme';

const ACCENT = '#00B14F';

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
      <Stack.Screen options={{ headerShown: true, title: 'สรุปคำสั่งซื้อ' }} />
      {lines.map((line) => (
        <View key={line.lineId} style={s.row}>
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
      <View style={s.divider} />
      <View style={s.row}>
        <Text style={s.name}>รวม</Text>
        <Text style={s.strike}>฿{displayTotal.toFixed(0)}</Text>
      </View>
      <View style={s.row}>
        <Text style={[s.name, { fontWeight: '800' }]}>ยอดชำระ (โปรเปิดตัว)</Text>
        <Text style={s.free}>฿0</Text>
      </View>
      <Text style={s.fine}>* ทุกออเดอร์ฟรีตลอดไป เพราะเราไม่เคยส่งถึงใครเลย</Text>
      <Pressable
        style={[s.cta, (busy || lines.length === 0) && { opacity: 0.5 }]}
        disabled={busy || lines.length === 0}
        onPress={submit}
      >
        <Text style={s.ctaText}>{busy ? 'กำลังหาไรเดอร์...' : 'สั่งเลย'}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  name: { fontSize: 15 },
  sub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  price: { fontSize: 15, color: theme.textMuted },
  strike: { fontSize: 15, color: theme.textMuted, textDecorationLine: 'line-through' },
  free: { fontSize: 18, fontWeight: '800', color: theme.green },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  fine: { fontSize: 11, color: '#bbb', marginTop: 4 },
  cta: { borderRadius: theme.radius, padding: 16, alignItems: 'center', marginTop: 24, backgroundColor: ACCENT },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
