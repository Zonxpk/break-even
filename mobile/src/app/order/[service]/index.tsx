import { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, Image, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchCatalog } from '../../../api/content';
import { SERVICE_CONFIGS } from '../../../services/config';
import { theme } from '../../../ui/theme';
import { PaperBackground } from '../../../ui/doodle/PaperBackground';
import { Sketch } from '../../../ui/doodle/Sketch';
import { CrayonCta } from '../../../ui/doodle/CrayonCta';
import { doodleHeader } from '../../../ui/doodle/nav';
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
      <PaperBackground />
      <Stack.Screen options={{ ...doodleHeader, title: cfg.title }} />
      <Text style={s.section}>{cfg.catalogTitle}</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        renderItem={({ item, index }) => {
          const selected = picked.some((i) => i.id === item.id);
          return (
            <Pressable onPress={() => toggle(item)}>
              <Sketch
                style={s.card}
                fill={selected ? theme.doodle.yellowWash : theme.doodle.card}
                stroke={selected ? theme.doodle.coral : theme.doodle.ink}
                seed={index + 1}
                radius={18}
              >
                <View style={s.cardInner}>
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
                      {item.rating ? `⭐ ${item.rating} · ` : ''}ส่งฟรี (เพราะไม่ส่ง)
                    </Text>
                  </View>
                  <Text style={s.price}>฿{item.price.toFixed(0)}</Text>
                </View>
              </Sketch>
            </Pressable>
          );
        }}
      />
      <CrayonCta
        label={`ไปหน้าสรุป (${picked.length})`}
        disabled={picked.length === 0}
        seed={99}
        style={s.cta}
        onPress={() =>
          router.push({
            pathname: '/order/[service]/confirm',
            params: { service: cfg.key, items: JSON.stringify(picked) },
          })
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper, padding: theme.pad },
  section: { fontFamily: theme.fontBold, fontSize: 17, color: theme.doodle.ink, marginBottom: 10 },
  list: { paddingBottom: 8 },
  card: { marginBottom: 10 },
  cardInner: { flexDirection: 'row', gap: 12, padding: 12, alignItems: 'center' },
  photo: { width: 56, height: 56, borderRadius: 10, borderWidth: 2, borderColor: theme.doodle.ink },
  photoFallback: { backgroundColor: theme.doodle.paper2, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink },
  meta: { fontFamily: theme.font, color: theme.doodle.inkSoft, fontSize: 12, marginTop: 2 },
  price: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.coral },
  cta: { marginTop: 8 },
});
