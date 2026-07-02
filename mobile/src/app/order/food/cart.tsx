import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { cartLineTotal } from '../../../food/cartMath';
import { useFoodCart } from '../../../state/foodCart';
import { theme } from '../../../ui/theme';
import { PaperBackground } from '../../../ui/doodle/PaperBackground';
import { Sketch } from '../../../ui/doodle/Sketch';
import { CrayonCta } from '../../../ui/doodle/CrayonCta';
import { doodleHeader } from '../../../ui/doodle/nav';

export default function FoodCart() {
  const router = useRouter();
  const cart = useFoodCart();
  const { lines, deliveryFee } = cart;
  const subtotal = cart.subtotal();
  const grand = subtotal + deliveryFee;

  return (
    <View style={s.root}>
      <PaperBackground />
      <Stack.Screen options={{ ...doodleHeader, title: 'ตะกร้า' }} />
      {lines.length === 0 ? (
        <Text style={s.empty}>ตะกร้าว่าง — เหมือนคำสัญญาของไรเดอร์</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.pad }}>
          <Sketch style={s.card} fill={theme.doodle.card} seed={4} radius={18}>
            <View style={s.cardInner}>
              {lines.map((line, li) => (
                <View key={line.lineId} style={[s.line, li > 0 && s.lineDivider]}>
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
                    <Pressable style={s.stepBtn} onPress={() => cart.updateQuantity(line.lineId, line.quantity - 1)}>
                      <Text style={s.stepBtnText}>−</Text>
                    </Pressable>
                    <Text style={s.qtyText}>{line.quantity}</Text>
                    <Pressable style={s.stepBtn} onPress={() => cart.updateQuantity(line.lineId, line.quantity + 1)}>
                      <Text style={s.stepBtnText}>+</Text>
                    </Pressable>
                    <Text style={s.linePrice}>฿{cartLineTotal(line).toFixed(0)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Sketch>

          <Sketch style={s.totals} fill={theme.doodle.paper2} seed={9} radius={16}>
            <View style={s.totalsInner}>
              <View style={s.row}>
                <Text style={s.rowText}>รวมอาหาร</Text>
                <Text style={s.rowText}>฿{subtotal.toFixed(0)}</Text>
              </View>
              <View style={s.row}>
                <Text style={s.rowText}>ค่าส่ง</Text>
                <Text style={s.rowText}>฿{deliveryFee.toFixed(0)}</Text>
              </View>
              <View style={s.row}>
                <Text style={s.rowBold}>รวม (แสดงเท่านั้น)</Text>
                <Text style={s.strike}>฿{grand.toFixed(0)}</Text>
              </View>
              <Text style={s.fine}>* ชำระจริง ฿0 ที่หน้าถัดไป</Text>
            </View>
          </Sketch>
        </ScrollView>
      )}
      <CrayonCta
        label="ไปชำระเงิน"
        disabled={lines.length === 0}
        seed={99}
        style={s.cta}
        onPress={() => router.push('/order/food/confirm')}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper },
  empty: { fontFamily: theme.font, textAlign: 'center', marginTop: 40, color: theme.doodle.inkSoft },
  card: { transform: [{ rotate: '-0.4deg' }] },
  cardInner: { paddingHorizontal: 13, paddingVertical: 5 },
  line: { paddingVertical: 10 },
  lineDivider: { borderTopWidth: 2, borderTopColor: theme.doodle.grid, borderStyle: 'dotted' },
  lineTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  lineName: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink, flex: 1 },
  remove: { fontFamily: theme.fontBold, color: theme.doodle.coral, fontSize: 13 },
  mod: { fontFamily: theme.font, fontSize: 12, color: theme.doodle.inkSoft, marginTop: 3 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  stepBtn: {
    width: 26, height: 26, borderRadius: 999,
    borderWidth: 2.5, borderColor: theme.doodle.ink,
    backgroundColor: theme.doodle.yellowWash,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink, lineHeight: 18 },
  qtyText: { fontFamily: theme.fontBold, color: theme.doodle.ink },
  linePrice: { marginLeft: 'auto', fontFamily: theme.fontBold, color: theme.doodle.coral },
  totals: { marginTop: 14, transform: [{ rotate: '0.4deg' }] },
  totalsInner: { padding: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowText: { fontFamily: theme.font, color: theme.doodle.ink },
  rowBold: { fontFamily: theme.fontBold, color: theme.doodle.ink },
  strike: { fontFamily: theme.font, textDecorationLine: 'line-through', color: theme.doodle.inkSoft },
  fine: { fontFamily: theme.font, fontSize: 11, color: theme.doodle.inkSoft, marginTop: 8 },
  cta: { margin: theme.pad },
});
