import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { fetchFoodPromos, fetchFoodRestaurants } from '../../../api/food';
import { allCuisineTags, filterRestaurants } from '../../../food/search';
import { theme } from '../../../ui/theme';
import type { FoodPromo, FoodRestaurant } from '../../../types/db';

const ACCENT = '#00B14F';

export default function FoodRestaurantList() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<FoodRestaurant[]>([]);
  const [promos, setPromos] = useState<FoodPromo[]>([]);
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, p] = await Promise.all([fetchFoodRestaurants(), fetchFoodPromos()]);
      setRestaurants(r);
      setPromos(p);
    } catch {
      setError('โหลดร้านไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tags = useMemo(() => allCuisineTags(restaurants), [restaurants]);
  const filtered = useMemo(
    () => filterRestaurants(restaurants, query, activeTags),
    [restaurants, query, activeTags],
  );

  const toggleTag = (tag: string) =>
    setActiveTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: 'สั่งอาหาร' }} />
      <TextInput
        style={s.search}
        placeholder="ค้นหาร้านหรือประเภทอาหาร"
        value={query}
        onChangeText={setQuery}
        testID="food-search"
      />
      {tags.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}>
          {tags.map((tag) => {
            const on = activeTags.includes(tag);
            return (
              <Pressable key={tag} style={[s.chip, on && s.chipOn]} onPress={() => toggleTag(tag)}>
                <Text style={[s.chipText, on && s.chipTextOn]}>{tag}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {promos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.promos}>
          {promos.map((p) => (
            <Pressable
              key={p.id}
              style={s.promoCard}
              onPress={() => p.restaurant_id && router.push(`/order/food/${p.restaurant_id}`)}
            >
              <Text style={s.promoTitle}>{p.title}</Text>
              {p.subtitle ? <Text style={s.promoSub}>{p.subtitle}</Text> : null}
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={ACCENT} />
      ) : error ? (
        <View style={s.center}>
          <Text style={s.muted}>{error}</Text>
          <Pressable style={s.retry} onPress={load}>
            <Text style={s.retryText}>ลองใหม่</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <Text style={[s.muted, { marginTop: 40, textAlign: 'center' }]}>ยังไม่มีร้านเปิดในพื้นที่นี้</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable style={s.card} onPress={() => router.push(`/order/food/${item.id}`)} testID={`restaurant-${item.id}`}>
              {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={s.photo} />
              ) : (
                <View style={[s.photo, s.photoFallback]}>
                  <Text style={{ fontSize: 28 }}>🍜</Text>
                </View>
              )}
              <View style={s.cardBody}>
                <View style={s.cardTop}>
                  <Text style={s.name}>{item.name}</Text>
                  {item.promo_badge ? <Text style={s.badge}>{item.promo_badge}</Text> : null}
                </View>
                <Text style={s.meta}>
                  {item.rating ? `★ ${item.rating}` : ''}
                  {item.review_count ? ` (${item.review_count})` : ''} · {item.eta_minutes} นาที · ส่ง ฿
                  {Number(item.delivery_fee).toFixed(0)}
                </Text>
                <Text style={s.tags}>{item.cuisine_tags.join(' · ')}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  search: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: theme.radius,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  chips: { marginBottom: 10, maxHeight: 40 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.surface,
    marginRight: 8,
  },
  chipOn: { backgroundColor: ACCENT },
  chipText: { fontSize: 13, color: theme.text },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  promos: { marginBottom: 12, maxHeight: 72 },
  promoCard: {
    width: 200,
    padding: 12,
    marginRight: 10,
    borderRadius: theme.radius,
    backgroundColor: '#E8F7EE',
  },
  promoTitle: { fontWeight: '700', color: theme.greenDark },
  promoSub: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: theme.radius,
    backgroundColor: theme.surface,
    marginBottom: 10,
  },
  photo: { width: 72, height: 72, borderRadius: 8 },
  photoFallback: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontWeight: '700', fontSize: 16, flex: 1 },
  badge: { fontSize: 11, fontWeight: '700', color: ACCENT },
  meta: { fontSize: 13, color: theme.textMuted, marginTop: 4 },
  tags: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  center: { alignItems: 'center', marginTop: 40, gap: 12 },
  muted: { color: theme.textMuted },
  retry: { backgroundColor: ACCENT, paddingHorizontal: 20, paddingVertical: 10, borderRadius: theme.radius },
  retryText: { color: '#fff', fontWeight: '700' },
});
