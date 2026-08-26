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
import { PaperBackground } from '../../../ui/doodle/PaperBackground';
import { Sketch } from '../../../ui/doodle/Sketch';
import { CrayonCta } from '../../../ui/doodle/CrayonCta';
import { doodleHeader } from '../../../ui/doodle/nav';
import type { FoodPromo, FoodRestaurant } from '../../../types/db';

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
      <PaperBackground />
      <Stack.Screen options={{ ...doodleHeader, title: 'สั่งอาหาร' }} />
      <Sketch style={s.searchWrap} fill={theme.doodle.card} seed={3} radius={14}>
        <TextInput
          style={s.search}
          placeholder="ค้นหาร้านหรือประเภทอาหาร"
          placeholderTextColor={theme.doodle.inkSoft}
          value={query}
          onChangeText={setQuery}
          testID="food-search"
        />
      </Sketch>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.promos}
          contentContainerStyle={s.promosContent}
        >
          {promos.map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => p.restaurant_id && router.push(`/order/food/${p.restaurant_id}`)}
            >
              <Sketch
                style={[s.promoCard, { transform: [{ rotate: i % 2 ? '0.7deg' : '-0.7deg' }] }]}
                fill={theme.doodle.yellowWash}
                seed={30 + i}
                radius={14}
              >
                <View style={s.promoInner}>
                  <Text style={s.promoTitle}>{p.title}</Text>
                  {p.subtitle ? <Text style={s.promoSub}>{p.subtitle}</Text> : null}
                </View>
              </Sketch>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.doodle.coral} />
      ) : error ? (
        <View style={s.center}>
          <Text style={s.muted}>{error}</Text>
          <CrayonCta label="ลองใหม่" seed={77} onPress={load} />
        </View>
      ) : filtered.length === 0 ? (
        <Text style={[s.muted, { marginTop: 40, textAlign: 'center' }]}>ยังไม่มีร้านเปิดในพื้นที่นี้</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <Pressable onPress={() => router.push(`/order/food/${item.id}`)} testID={`restaurant-${item.id}`}>
              <Sketch style={s.card} fill={theme.doodle.card} seed={index + 1} radius={18}>
                <View style={s.cardInner}>
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
                      {item.rating ? `⭐ ${item.rating}` : ''}
                      {item.review_count ? ` (${item.review_count})` : ''} · {item.eta_minutes} นาที · ส่ง ฿
                      {Number(item.delivery_fee).toFixed(0)}
                    </Text>
                    <Text style={s.tags}>{item.cuisine_tags.join(' · ')}</Text>
                  </View>
                </View>
              </Sketch>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper, padding: theme.pad },
  searchWrap: { marginBottom: 10 },
  search: { fontFamily: theme.font, padding: 12, fontSize: 15, color: theme.doodle.ink },
  chips: { marginBottom: 10, maxHeight: 44, flexGrow: 0 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: theme.doodle.ink,
    backgroundColor: theme.doodle.card,
    marginRight: 8,
  },
  chipOn: { backgroundColor: theme.doodle.yellowWash, borderColor: theme.doodle.yellow },
  chipText: { fontFamily: theme.fontBold, fontSize: 13, color: theme.doodle.ink },
  chipTextOn: { color: '#6a531a' },
  promos: { marginBottom: 8, maxHeight: 96, flexGrow: 0 },
  promosContent: { paddingVertical: 4 },
  promoCard: { width: 200, minHeight: 72, marginRight: 10 },
  promoInner: { padding: 12 },
  promoTitle: { fontFamily: theme.fontBold, color: theme.doodle.ink, fontSize: 13 },
  promoSub: { fontFamily: theme.font, fontSize: 12, color: theme.doodle.inkSoft, marginTop: 2 },
  card: { marginBottom: 10 },
  cardInner: { flexDirection: 'row', gap: 12, padding: 12, alignItems: 'center' },
  photo: { width: 64, height: 64, borderRadius: 10, borderWidth: 2, borderColor: theme.doodle.ink },
  photoFallback: { backgroundColor: theme.doodle.paper2, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink, flex: 1 },
  badge: { fontFamily: theme.fontBold, fontSize: 11, color: theme.doodle.coral },
  meta: { fontFamily: theme.font, fontSize: 12, color: theme.doodle.inkSoft, marginTop: 3 },
  tags: { fontFamily: theme.font, fontSize: 11, color: theme.doodle.inkSoft, marginTop: 2 },
  center: { alignItems: 'center', marginTop: 40, gap: 12 },
  muted: { fontFamily: theme.font, color: theme.doodle.inkSoft },
});
