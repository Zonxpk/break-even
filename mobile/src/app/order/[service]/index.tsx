import { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, Image, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchCatalog } from '../../../api/content';
import { SERVICE_CONFIGS } from '../../../services/config';
import { theme } from '../../../ui/theme';
import type { CatalogItem, Service } from '../../../types/db';

export default function Browse() {
  const { service } = useLocalSearchParams<{ service: Service }>();
  const router = useRouter();
  const cfg = SERVICE_CONFIGS[service as Service];
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [picked, setPicked] = useState<CatalogItem[]>([]);

  useEffect(() => {
    if (service === 'food') router.replace('/order/food');
  }, [service, router]);

  useEffect(() => {
    if (cfg && service !== 'food') fetchCatalog(cfg.key).then(setItems).catch(() => {});
  }, [service, cfg]);

  if (!cfg) return null;

  const toggle = (item: CatalogItem) =>
    setPicked((p) => (p.some((i) => i.id === item.id) ? p.filter((i) => i.id !== item.id) : [...p, item]));

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: cfg.title }} />
      <Text style={s.section}>{cfg.catalogTitle}</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const selected = picked.some((i) => i.id === item.id);
          return (
            <Pressable style={[s.card, selected && { borderColor: cfg.accent, borderWidth: 2 }]} onPress={() => toggle(item)}>
              {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={s.photo} />
              ) : (
                <View style={[s.photo, s.photoFallback]}>
                  <Text style={{ fontSize: 28 }}>🍱</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.meta}>
                  {item.rating ? `★ ${item.rating}  · ` : ''}฿{item.price.toFixed(0)} · ส่งฟรี
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
      <Pressable
        style={[s.cta, { backgroundColor: cfg.accent }, picked.length === 0 && { opacity: 0.4 }]}
        disabled={picked.length === 0}
        onPress={() => {
          router.push({
            pathname: '/order/[service]/confirm',
            params: { service: cfg.key, items: JSON.stringify(picked) },
          });
        }}
      >
        <Text style={s.ctaText}>ไปหน้าสรุป ({picked.length})</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  card: {
    flexDirection: 'row', gap: 12, padding: 12, borderRadius: theme.radius,
    backgroundColor: theme.surface, marginBottom: 10, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  photo: { width: 64, height: 64, borderRadius: 8 },
  photoFallback: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '600', fontSize: 15 },
  meta: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  cta: { borderRadius: theme.radius, padding: 16, alignItems: 'center', marginTop: 8 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
