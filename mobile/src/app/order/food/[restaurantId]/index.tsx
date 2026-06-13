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
import type { FoodMenuBundle, FoodMenuCategory, FoodMenuItem } from '../../../../types/db';

const ACCENT = '#00B14F';

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
        <Text style={s.muted}>{error}</Text>
      </View>
    );
  }

  if (!menu) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={ACCENT} />
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
      <Stack.Screen options={{ headerShown: true, title: restaurant.name }} />
      <ScrollView contentContainerStyle={{ paddingBottom: count > 0 ? 88 : 24 }}>
        <View style={s.header}>
          {restaurant.banner_url ? (
            <Image source={{ uri: restaurant.banner_url }} style={s.banner} />
          ) : (
            <View style={[s.banner, s.bannerFallback]}>
              <Text style={{ fontSize: 40 }}>🍽️</Text>
            </View>
          )}
          <Text style={s.title}>{restaurant.name}</Text>
          <Text style={s.meta}>
            {restaurant.rating ? `★ ${restaurant.rating}` : ''}
            {restaurant.review_count ? ` (${restaurant.review_count})` : ''} · {restaurant.eta_minutes} นาที · ส่ง ฿
            {Number(restaurant.delivery_fee).toFixed(0)}
          </Text>
        </View>

        {items.length === 0 ? (
          <Text style={s.muted}>ร้านนี้ปิดเมนูชั่วคราว</Text>
        ) : (
          categories.map((cat) => (
            <View key={cat.id} style={s.section}>
              <Text style={s.sectionTitle}>{cat.name}</Text>
              {itemsFor(cat).map((item) => (
                <DishRow
                  key={item.id}
                  item={item}
                  onAdd={() => router.push(`/order/food/${restaurantId}/item/${item.id}`)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {count > 0 ? (
        <Pressable style={s.cartBar} onPress={() => router.push('/order/food/cart')}>
          <Text style={s.cartBarText}>
            ดูตะกร้า · {count} รายการ · ฿{total.toFixed(0)}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function DishRow({ item, onAdd }: { item: FoodMenuItem; onAdd: () => void }) {
  return (
    <View style={s.dish}>
      {item.photo_url ? (
        <Image source={{ uri: item.photo_url }} style={s.dishPhoto} />
      ) : (
        <View style={[s.dishPhoto, s.photoFallback]}>
          <Text style={{ fontSize: 24 }}>🍱</Text>
        </View>
      )}
      <View style={s.dishBody}>
        <Text style={s.dishName}>{item.name}</Text>
        {item.description ? <Text style={s.dishDesc} numberOfLines={1}>{item.description}</Text> : null}
        <Text style={s.dishPrice}>฿{Number(item.price).toFixed(0)}</Text>
      </View>
      <Pressable style={s.addBtn} onPress={onAdd} accessibilityLabel={`เพิ่ม ${item.name}`}>
        <Text style={s.addBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: theme.pad },
  banner: { width: '100%', height: 120, borderRadius: theme.radius, marginBottom: 12 },
  bannerFallback: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  meta: { fontSize: 13, color: theme.textMuted, marginTop: 4 },
  section: { paddingHorizontal: theme.pad, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  dish: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dishPhoto: { width: 56, height: 56, borderRadius: 8 },
  photoFallback: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  dishBody: { flex: 1 },
  dishName: { fontWeight: '600', fontSize: 15 },
  dishDesc: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  dishPrice: { fontSize: 14, color: theme.textMuted, marginTop: 2 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  muted: { color: theme.textMuted, padding: theme.pad },
  cartBar: {
    position: 'absolute',
    left: theme.pad,
    right: theme.pad,
    bottom: theme.pad,
    backgroundColor: ACCENT,
    borderRadius: theme.radius,
    padding: 16,
    alignItems: 'center',
  },
  cartBarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
