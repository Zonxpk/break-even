import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { cartLineTotal } from '../../../food/cartMath';
import { useFoodCart } from '../../../state/foodCart';
import { theme } from '../../../ui/theme';

const ACCENT = '#00B14F';

export default function FoodCart() {
  const router = useRouter();
  const cart = useFoodCart();
  const { lines, deliveryFee } = cart;
  const subtotal = cart.subtotal();
  const grand = subtotal + deliveryFee;

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: 'ตะกร้า' }} />
      {lines.length === 0 ? (
        <Text style={s.empty}>ตะกร้าว่าง</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.pad }}>
          {lines.map((line) => (
            <View key={line.lineId} style={s.line}>
              <View style={s.lineTop}>
                <Text style={s.lineName}>
                  {line.name} × {line.quantity}
                </Text>
                <Pressable onPress={() => cart.removeLine(line.lineId)}>
                  <Text style={s.remove}>ลบ</Text>
                </Pressable>
              </View>
              {line.modifiers.map((m) => (
                <Text key={`${m.groupId}-${m.optionId}`} style={s.mod}>
                  {m.groupName}: {m.optionName}
                </Text>
              ))}
              {line.notes ? <Text style={s.mod}>หมายเหตุ: {line.notes}</Text> : null}
              <View style={s.qtyRow}>
                <Pressable onPress={() => cart.updateQuantity(line.lineId, line.quantity - 1)}>
                  <Text style={s.step}>−</Text>
                </Pressable>
                <Text>{line.quantity}</Text>
                <Pressable onPress={() => cart.updateQuantity(line.lineId, line.quantity + 1)}>
                  <Text style={s.step}>+</Text>
                </Pressable>
                <Text style={s.linePrice}>฿{cartLineTotal(line).toFixed(0)}</Text>
              </View>
            </View>
          ))}
          <View style={s.divider} />
          <View style={s.row}>
            <Text>รวมอาหาร</Text>
            <Text>฿{subtotal.toFixed(0)}</Text>
          </View>
          <View style={s.row}>
            <Text>ค่าส่ง</Text>
            <Text>฿{deliveryFee.toFixed(0)}</Text>
          </View>
          <View style={s.row}>
            <Text style={{ fontWeight: '800' }}>รวม (แสดงเท่านั้น)</Text>
            <Text style={s.strike}>฿{grand.toFixed(0)}</Text>
          </View>
          <Text style={s.fine}>* ชำระจริง ฿0 ที่หน้าถัดไป</Text>
        </ScrollView>
      )}
      <Pressable
        style={[s.cta, lines.length === 0 && { opacity: 0.4 }]}
        disabled={lines.length === 0}
        onPress={() => router.push('/order/food/confirm')}
      >
        <Text style={s.ctaText}>ไปชำระเงิน</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  empty: { textAlign: 'center', marginTop: 40, color: theme.textMuted },
  line: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  lineTop: { flexDirection: 'row', justifyContent: 'space-between' },
  lineName: { fontWeight: '700', fontSize: 15, flex: 1 },
  remove: { color: theme.danger, fontSize: 13 },
  mod: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  step: { fontSize: 20, color: ACCENT, fontWeight: '700', paddingHorizontal: 6 },
  linePrice: { marginLeft: 'auto', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  strike: { textDecorationLine: 'line-through', color: theme.textMuted },
  fine: { fontSize: 11, color: '#bbb', marginTop: 8 },
  cta: {
    margin: theme.pad,
    backgroundColor: ACCENT,
    borderRadius: theme.radius,
    padding: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
