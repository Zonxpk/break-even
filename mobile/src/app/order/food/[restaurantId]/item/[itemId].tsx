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
import { PaperBackground } from '../../../../../ui/doodle/PaperBackground';
import { Sketch } from '../../../../../ui/doodle/Sketch';
import { CrayonCta } from '../../../../../ui/doodle/CrayonCta';
import { doodleHeader } from '../../../../../ui/doodle/nav';
import type { FoodModifierGroup } from '../../../../../types/db';

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
        <PaperBackground />
        <ActivityIndicator color={theme.doodle.coral} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <PaperBackground />
      <Stack.Screen options={{ ...doodleHeader, presentation: 'modal', title: 'รายละเอียด' }} />
      <ScrollView contentContainerStyle={{ padding: theme.pad, paddingBottom: 110 }}>
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

        {item.groups.map((g, gi) => (
          <View key={g.id} style={s.group}>
            <Text style={s.groupTitle}>
              {g.name}
              {g.min_select > 0 ? ' *' : ''}
            </Text>
            {g.min_select > 0 && !(selected[g.id]?.length >= g.min_select) ? (
              <Text style={s.hint}>กรุณาเลือกอย่างน้อย {g.min_select} ตัวเลือก</Text>
            ) : null}
            <Sketch style={s.groupCard} fill={theme.doodle.card} seed={gi + 8} radius={16}>
              <View style={s.groupCardInner}>
                {g.options.map((opt, oi) => {
                  const on = (selected[g.id] ?? []).includes(opt.id);
                  return (
                    <Pressable
                      key={opt.id}
                      style={[s.optRow, oi > 0 && s.optDivider]}
                      onPress={() => toggleOption(g, opt.id)}
                    >
                      <Text style={[s.optRadio, on && s.optRadioOn]}>
                        {g.max_select === 1 ? (on ? '◉' : '○') : on ? '☑' : '☐'}
                      </Text>
                      <Text style={s.optName}>{opt.name}</Text>
                      {Number(opt.price_delta) > 0 ? (
                        <Text style={s.optDelta}>+฿{Number(opt.price_delta).toFixed(0)}</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </Sketch>
          </View>
        ))}

        <Text style={s.groupTitle}>หมายเหตุ</Text>
        <Sketch style={s.notesWrap} fill={theme.doodle.card} seed={17} radius={14}>
          <TextInput
            style={s.notes}
            placeholder="หมายเหตุถึงร้าน เช่น ไม่ใส่ผักชี"
            placeholderTextColor={theme.doodle.inkSoft}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </Sketch>

        <View style={s.qtyRow}>
          <Text style={s.groupTitle}>จำนวน</Text>
          <View style={s.stepper}>
            <Pressable style={s.stepBtn} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Text style={s.stepBtnText}>−</Text>
            </Pressable>
            <Text style={s.qty}>{quantity}</Text>
            <Pressable style={s.stepBtn} onPress={() => setQuantity((q) => q + 1)}>
              <Text style={s.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <CrayonCta
        label={`เพิ่มลงตะกร้า · ฿${lineTotal.toFixed(0)}`}
        disabled={!validation.ok}
        seed={99}
        style={s.cta}
        onPress={addToCart}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.doodle.paper },
  photo: { width: '100%', height: 160, borderRadius: 12, borderWidth: 2.5, borderColor: theme.doodle.ink, marginBottom: 12 },
  photoFallback: { backgroundColor: theme.doodle.paper2, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: theme.fontBold, fontSize: 20, color: theme.doodle.ink },
  desc: { fontFamily: theme.font, fontSize: 14, color: theme.doodle.inkSoft, marginTop: 5 },
  price: { fontFamily: theme.fontBold, fontSize: 16, color: theme.doodle.coral, marginTop: 8, marginBottom: 16 },
  group: { marginBottom: 16 },
  groupTitle: { fontFamily: theme.fontBold, color: theme.doodle.ink, marginBottom: 8 },
  hint: { fontFamily: theme.font, fontSize: 12, color: theme.doodle.coral, marginBottom: 6 },
  groupCard: { transform: [{ rotate: '-0.3deg' }] },
  groupCardInner: { paddingHorizontal: 13, paddingVertical: 3 },
  optRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  optDivider: { borderTopWidth: 2, borderTopColor: theme.doodle.grid, borderStyle: 'dotted' },
  optRadio: { fontSize: 17, width: 24, color: theme.doodle.inkSoft },
  optRadioOn: { color: theme.doodle.coral },
  optName: { flex: 1, fontFamily: theme.font, fontSize: 14, color: theme.doodle.ink },
  optDelta: { fontFamily: theme.fontBold, color: theme.doodle.coral, fontSize: 13 },
  notesWrap: { marginBottom: 8 },
  notes: {
    fontFamily: theme.font,
    color: theme.doodle.ink,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 28, height: 28, borderRadius: 999,
    borderWidth: 2.5, borderColor: theme.doodle.ink,
    backgroundColor: theme.doodle.yellowWash,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { fontFamily: theme.fontBold, fontSize: 16, color: theme.doodle.ink, lineHeight: 20 },
  qty: { fontFamily: theme.fontBold, fontSize: 18, color: theme.doodle.ink, minWidth: 24, textAlign: 'center' },
  cta: { position: 'absolute', left: theme.pad, right: theme.pad, bottom: theme.pad },
});
