import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchRestaurantMenu } from '../../../../../api/food';
import { cartLineTotal, validateModifierSelection } from '../../../../../food/cartMath';
import { canAddToCart, useFoodCart } from '../../../../../state/foodCart';
import { theme } from '../../../../../ui/theme';
import type { FoodModifierGroup } from '../../../../../types/db';

const ACCENT = '#00B14F';

export default function FoodItemSheet() {
  const { restaurantId, itemId } = useLocalSearchParams<{ restaurantId: string; itemId: string }>();
  const router = useRouter();
  const cart = useFoodCart();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<{
    name: string;
    description: string | null;
    photo_url: string | null;
    price: number;
    restaurantName: string;
    groups: FoodModifierGroup[];
  } | null>(null);

  useEffect(() => {
    if (!restaurantId || !itemId) return;
    fetchRestaurantMenu(restaurantId)
      .then((m) => {
        const found = m.items.find((i) => i.id === itemId);
        if (!found) throw new Error('not found');
        setItem({
          name: found.name,
          description: found.description,
          photo_url: found.photo_url,
          price: Number(found.price),
          restaurantName: m.restaurant.name,
          groups: m.modifierGroupsByItemId[itemId] ?? [],
        });
        cart.setRestaurant(m.restaurant.id, m.restaurant.name, Number(m.restaurant.delivery_fee));
      })
      .catch(() => Alert.alert('ขออภัย', 'ไม่พบเมนูนี้', [{ text: 'ตกลง', onPress: () => router.back() }]))
      .finally(() => setLoading(false));
  }, [restaurantId, itemId]);

  const validation = useMemo(
    () => (item ? validateModifierSelection(selected, item.groups) : { ok: false }),
    [item, selected],
  );

  const lineTotal = useMemo(() => {
    if (!item) return 0;
    const modifiers = item.groups.flatMap((g) =>
      (selected[g.id] ?? []).map((oid) => {
        const opt = g.options.find((o) => o.id === oid)!;
        return {
          groupId: g.id,
          groupName: g.name,
          optionId: opt.id,
          optionName: opt.name,
          priceDelta: Number(opt.price_delta),
        };
      }),
    );
    return cartLineTotal({
      lineId: 'preview',
      menuItemId: itemId!,
      restaurantId: restaurantId!,
      restaurantName: item.restaurantName,
      name: item.name,
      unitPrice: item.price,
      quantity,
      modifiers,
      notes: notes || null,
    });
  }, [item, selected, quantity, notes, itemId, restaurantId]);

  const toggleOption = (group: FoodModifierGroup, optionId: string) => {
    setSelected((prev) => {
      const cur = prev[group.id] ?? [];
      if (group.max_select === 1) return { ...prev, [group.id]: [optionId] };
      if (cur.includes(optionId)) return { ...prev, [group.id]: cur.filter((id) => id !== optionId) };
      if (cur.length >= group.max_select) return prev;
      return { ...prev, [group.id]: [...cur, optionId] };
    });
  };

  const addToCart = () => {
    if (!item || !validation.ok) return;
    const doAdd = () => {
      const modifiers = item.groups.flatMap((g) =>
        (selected[g.id] ?? []).map((oid) => {
          const opt = g.options.find((o) => o.id === oid)!;
          return {
            groupId: g.id,
            groupName: g.name,
            optionId: opt.id,
            optionName: opt.name,
            priceDelta: Number(opt.price_delta),
          };
        }),
      );
      cart.addLine({
        lineId: `${itemId}-${Date.now()}`,
        menuItemId: itemId!,
        restaurantId: restaurantId!,
        restaurantName: item.restaurantName,
        name: item.name,
        unitPrice: item.price,
        quantity,
        modifiers,
        notes: notes.trim() || null,
      });
      router.back();
    };

    if (!canAddToCart(restaurantId!)) {
      Alert.alert('ล้างตะกร้าและเปลี่ยนร้าน?', 'ตะกร้ามีรายการจากร้านอื่นอยู่', [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ล้างและเพิ่ม', onPress: () => { cart.clear(); doAdd(); } },
      ]);
      return;
    }
    doAdd();
  };

  if (loading || !item) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={ACCENT} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Stack.Screen options={{ presentation: 'modal', headerShown: true, title: 'รายละเอียด' }} />
      <ScrollView contentContainerStyle={{ padding: theme.pad, paddingBottom: 100 }}>
        {item.photo_url ? (
          <Image source={{ uri: item.photo_url }} style={s.photo} />
        ) : (
          <View style={[s.photo, s.photoFallback]}>
            <Text style={{ fontSize: 40 }}>🍱</Text>
          </View>
        )}
        <Text style={s.name}>{item.name}</Text>
        {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
        <Text style={s.price}>฿{item.price.toFixed(0)}</Text>

        {item.groups.map((g) => (
          <View key={g.id} style={s.group}>
            <Text style={s.groupTitle}>
              {g.name}
              {g.min_select > 0 ? ' *' : ''}
            </Text>
            {g.min_select > 0 && !(selected[g.id]?.length >= g.min_select) ? (
              <Text style={s.hint}>กรุณาเลือกอย่างน้อย {g.min_select} ตัวเลือก</Text>
            ) : null}
            {g.options.map((opt) => {
              const on = (selected[g.id] ?? []).includes(opt.id);
              return (
                <Pressable key={opt.id} style={s.optRow} onPress={() => toggleOption(g, opt.id)}>
                  <Text style={s.optRadio}>{g.max_select === 1 ? (on ? '◉' : '○') : on ? '☑' : '☐'}</Text>
                  <Text style={s.optName}>{opt.name}</Text>
                  {Number(opt.price_delta) > 0 ? (
                    <Text style={s.optDelta}>+฿{Number(opt.price_delta).toFixed(0)}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}

        <Text style={s.groupTitle}>หมายเหตุ</Text>
        <TextInput
          style={s.notes}
          placeholder="หมายเหตุถึงร้าน เช่น ไม่ใส่ผักชี"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={s.qtyRow}>
          <Text style={s.groupTitle}>จำนวน</Text>
          <View style={s.stepper}>
            <Pressable onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Text style={s.stepBtn}>−</Text>
            </Pressable>
            <Text style={s.qty}>{quantity}</Text>
            <Pressable onPress={() => setQuantity((q) => q + 1)}>
              <Text style={s.stepBtn}>+</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Pressable
        style={[s.cta, !validation.ok && { opacity: 0.4 }]}
        disabled={!validation.ok}
        onPress={addToCart}
      >
        <Text style={s.ctaText}>เพิ่มลงตะกร้า · ฿{lineTotal.toFixed(0)}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: 160, borderRadius: theme.radius, marginBottom: 12 },
  photoFallback: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '800' },
  desc: { fontSize: 14, color: theme.textMuted, marginTop: 6 },
  price: { fontSize: 16, color: theme.textMuted, marginTop: 8, marginBottom: 16 },
  group: { marginBottom: 16 },
  groupTitle: { fontWeight: '700', marginBottom: 8 },
  hint: { fontSize: 12, color: theme.danger, marginBottom: 6 },
  optRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  optRadio: { fontSize: 18, width: 24 },
  optName: { flex: 1, fontSize: 15 },
  optDelta: { color: theme.textMuted, fontSize: 13 },
  notes: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: theme.radius,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: { fontSize: 24, fontWeight: '700', color: ACCENT, paddingHorizontal: 8 },
  qty: { fontSize: 18, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  cta: {
    position: 'absolute',
    left: theme.pad,
    right: theme.pad,
    bottom: theme.pad,
    backgroundColor: ACCENT,
    borderRadius: theme.radius,
    padding: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
