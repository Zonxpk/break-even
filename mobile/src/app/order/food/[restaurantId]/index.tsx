import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchRestaurantMenu } from '../../../../api/food';
import { useFoodCart } from '../../../../state/foodCart';
import { theme } from '../../../../ui/theme';
import { PaperBackground } from '../../../../ui/doodle/PaperBackground';
import { Sketch } from '../../../../ui/doodle/Sketch';
import { CrayonCta } from '../../../../ui/doodle/CrayonCta';
import { doodleHeader } from '../../../../ui/doodle/nav';
import type { FoodMenuBundle, FoodMenuCategory, FoodMenuItem } from '../../../../types/db';

export default function RestaurantMenu() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const cart = useFoodCart();
  const [menu, setMenu] = useState<FoodMenuBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    fetchRestaurantMenu(restaurantId)
      .then((m) => {
        setMenu(m);
        if (!cart.restaurantId || cart.restaurantId === m.restaurant.id) {
          cart.setRestaurant(m.restaurant.id, m.restaurant.name, Number(m.restaurant.delivery_fee));
        }
      })
      .catch(() => setError('โหลดเมนูไม่สำเร็จ'));
  }, [restaurantId]);

  if (error) {
    return (
      <View style={s.center}>
        <PaperBackground />
        <Text style={s.muted}>{error}</Text>
      </View>
    );
  }

  if (!menu) {
    return (
      <View style={s.center}>
        <PaperBackground />
        <ActivityIndicator color={theme.doodle.coral} />
      </View>
    );
  }

  const { restaurant, categories, items } = menu;
  const count = cart.lineCount();
  const total = cart.subtotal() + cart.deliveryFee;

  const itemsFor = (cat: FoodMenuCategory) =>
    items.filter((i) => i.category_id === cat.id).sort((a, b) => a.sort - b.sort);

  return (
    <View style={s.root}>
      <PaperBackground />
      <Stack.Screen options={{ ...doodleHeader, title: restaurant.name }} />
      <ScrollView contentContainerStyle={{ paddingBottom: count > 0 ? 96 : 24 }}>
        <View style={s.header}>
          <Text style={s.tag}>เมนูดอง</Text>
          <Text style={s.title}>ร้าน “{restaurant.name}”</Text>
          <Text style={s.meta}>
            {restaurant.rating ? `⭐ ${restaurant.rating}` : ''}
            {restaurant.review_count ? ` (${restaurant.review_count})` : ''} · ส่ง{' '}
            <Text style={s.highlight}>{restaurant.eta_minutes} นาที+</Text> · ค่าส่ง ฿
            {Number(restaurant.delivery_fee).toFixed(0)} (เพราะไม่ส่ง)
          </Text>
          {restaurant.banner_url ? (
            <Image source={{ uri: restaurant.banner_url }} style={s.banner} />
          ) : null}
        </View>

        {items.length === 0 ? (
          <Text style={s.muted}>ร้านนี้ปิดเมนูชั่วคราว</Text>
        ) : (
          categories.map((cat, ci) => (
            <View key={cat.id} style={s.section}>
              <Text style={s.sectionTitle}>{cat.name}</Text>
              <Sketch style={s.menuCard} fill={theme.doodle.card} seed={ci + 5} radius={18}>
                <View style={s.menuCardInner}>
                  {itemsFor(cat).map((item, ii) => (
                    <DishRow
                      key={item.id}
                      item={item}
                      first={ii === 0}
                      onAdd={() => router.push(`/order/food/${restaurantId}/item/${item.id}`)}
                    />
                  ))}
                </View>
              </Sketch>
            </View>
          ))
        )}
      </ScrollView>

      {count > 0 ? (
        <CrayonCta
          label={`ดูตะกร้า · ${count} รายการ · ฿${total.toFixed(0)}`}
          seed={99}
          style={s.cartBar}
          onPress={() => router.push('/order/food/cart')}
        />
      ) : null}
    </View>
  );
}

function DishRow({ item, first, onAdd }: { item: FoodMenuItem; first: boolean; onAdd: () => void }) {
  return (
    <View style={[s.dish, !first && s.dishDivider]}>
      {item.photo_url ? (
        <Image source={{ uri: item.photo_url }} style={s.dishPhoto} />
      ) : (
        <View style={[s.dishPhoto, s.photoFallback]}>
          <Text style={{ fontSize: 22 }}>🍱</Text>
        </View>
      )}
      <View style={s.dishBody}>
        <Text style={s.dishName}>{item.name}</Text>
        {item.description ? <Text style={s.dishDesc} numberOfLines={1}>{item.description}</Text> : null}
      </View>
      <Text style={s.dishPrice}>฿{Number(item.price).toFixed(0)}</Text>
      <Pressable style={s.addBtn} onPress={onAdd} accessibilityLabel={`เพิ่ม ${item.name}`}>
        <Text style={s.addBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.doodle.paper },
  header: { paddingHorizontal: theme.pad, paddingTop: theme.pad, paddingBottom: 4 },
  tag: {
    alignSelf: 'flex-start',
    fontFamily: theme.fontBold, fontSize: 13, color: '#5a4410',
    backgroundColor: theme.doodle.yellow,
    borderWidth: 2.5, borderColor: theme.doodle.ink, borderRadius: 14,
    paddingHorizontal: 11, paddingVertical: 3, overflow: 'hidden',
    transform: [{ rotate: '-1deg' }],
  },
  title: { fontFamily: theme.fontBold, fontSize: 22, color: theme.doodle.ink, marginTop: 10, lineHeight: 28 },
  meta: { fontFamily: theme.font, fontSize: 14, color: theme.doodle.inkSoft, marginTop: 5 },
  highlight: { fontFamily: theme.fontBold, color: theme.doodle.ink, backgroundColor: theme.doodle.yellow },
  banner: { width: '100%', height: 120, borderRadius: 12, borderWidth: 2.5, borderColor: theme.doodle.ink, marginTop: 12 },
  section: { paddingHorizontal: theme.pad, marginTop: 14 },
  sectionTitle: { fontFamily: theme.fontBold, fontSize: 16, color: theme.doodle.ink, marginBottom: 8 },
  menuCard: { transform: [{ rotate: '-0.4deg' }] },
  menuCardInner: { paddingHorizontal: 13, paddingVertical: 4 },
  dish: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9 },
  dishDivider: { borderTopWidth: 2, borderTopColor: theme.doodle.grid, borderStyle: 'dotted' },
  dishPhoto: { width: 48, height: 48, borderRadius: 10, borderWidth: 2, borderColor: theme.doodle.ink },
  photoFallback: { backgroundColor: theme.doodle.paper2, alignItems: 'center', justifyContent: 'center' },
  dishBody: { flex: 1 },
  dishName: { fontFamily: theme.fontBold, fontSize: 14, color: theme.doodle.ink },
  dishDesc: { fontFamily: theme.font, fontSize: 11, color: theme.doodle.inkSoft, marginTop: 1 },
  dishPrice: { fontFamily: theme.fontBold, fontSize: 14, color: theme.doodle.coral },
  addBtn: {
    width: 28, height: 28, borderRadius: 999,
    borderWidth: 2.5, borderColor: theme.doodle.ink,
    backgroundColor: theme.doodle.yellowWash,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontFamily: theme.fontBold, color: theme.doodle.ink, fontSize: 16, lineHeight: 20 },
  muted: { fontFamily: theme.font, color: theme.doodle.inkSoft, padding: theme.pad },
  cartBar: { position: 'absolute', left: theme.pad, right: theme.pad, bottom: theme.pad },
});
