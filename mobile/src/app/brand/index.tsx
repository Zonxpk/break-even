import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { fetchActiveShops, fetchBrandMemberships, fetchMerchForShop, listMyClaims } from '../../api/shop';
import { theme } from '../../ui/theme';

export default function BrandHome() {
  const router = useRouter();
  const [stats, setStats] = useState({ items: 0, claims: 0 });

  useEffect(() => {
    (async () => {
      const memberships = await fetchBrandMemberships();
      if (!memberships.length) return;
      const shops = await fetchActiveShops();
      const shop = shops.find((s) => s.brand_id === memberships[0].brand_id);
      const items = shop ? await fetchMerchForShop(shop.id) : [];
      const claims = await listMyClaims();
      setStats({ items: items.length, claims: claims.length });
    })().catch(() => {});
  }, []);

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: 'จัดการร้าน' }} />
      <Text style={s.title}>แบรนด์โหมด</Text>
      <View style={s.card}>
        <Text style={s.stat}>สินค้าในร้าน: {stats.items}</Text>
        <Text style={s.stat}>เคลมทั้งหมด (ของฉัน): {stats.claims}</Text>
      </View>
      <Pressable style={s.row} onPress={() => router.push('/brand/redeem')}>
        <Text style={s.rowText}>📷 สแกน/กรอกโค้ดรับของ</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  title: { fontSize: 22, fontWeight: '800', marginTop: 8, marginBottom: 16 },
  card: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 16, gap: 8, marginBottom: 20 },
  stat: { fontSize: 15, fontWeight: '600' },
  row: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowText: { fontSize: 15, fontWeight: '600' },
});
