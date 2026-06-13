import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { claimMerchItem, fetchActiveShops, fetchMerchForShop, ShopError } from '../../api/shop';
import { formatCountdown, isShopOpen, msUntilNextOpen } from '../../shop/schedule';
import { theme } from '../../ui/theme';
import type { MerchItemRow, ShopRow } from '../../types/db';

export default function MerchShop() {
  const router = useRouter();
  const [shop, setShop] = useState<ShopRow | null>(null);
  const [items, setItems] = useState<MerchItemRow[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchActiveShops().then((shops) => {
      const s = shops[0] ?? null;
      setShop(s);
      if (s) fetchMerchForShop(s.id).then(setItems).catch(() => {});
    }).catch(() => {});
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const open = shop ? isShopOpen(shop.schedule, now) : false;
  const countdown = shop && !open ? formatCountdown(msUntilNextOpen(shop.schedule, now)) : '';

  async function onClaim(item: MerchItemRow) {
    if (!open) return;
    setClaiming(item.id);
    try {
      const claim = await claimMerchItem(item.id);
      router.push(`/merch/claim/${claim.id}`);
    } catch (e) {
      if (e instanceof ShopError) {
        const msg = e.code === 'INSUFFICIENT_VOUCHERS'
          ? 'คูปองไม่พอ — ไปผิดหวังอีกสักรอบก่อนนะ'
          : e.code === 'OUT_OF_STOCK'
            ? 'ของหมดแล้ว — รอบหน้าเอาใหม่'
            : 'แลกไม่ได้ตอนนี้';
        Alert.alert('แลกไม่สำเร็จ', msg);
      }
    } finally {
      setClaiming(null);
    }
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: theme.pad }}>
      <Stack.Screen options={{ headerShown: true, title: '🎁 ร้าน merch ป๊อปอัพ' }} />
      <Text style={s.title}>{shop?.name ?? 'ร้านป๊อปอัพ'}</Text>
      <View style={[s.badge, open ? s.open : s.closed]}>
        <Text style={s.badgeText}>{open ? 'เปิดอยู่!' : countdown || 'ปิดอยู่'}</Text>
      </View>

      {!shop ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.green} />
      ) : (
        items.map((item) => (
          <View key={item.id} style={s.card}>
            <Text style={s.name}>{item.name}</Text>
            {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
            <Text style={s.price}>🎟️ {item.voucher_price} คูปอง · เหลือ {item.stock}</Text>
            <Pressable
              style={[s.btn, (!open || item.stock <= 0) && s.btnDisabled]}
              disabled={!open || item.stock <= 0 || claiming === item.id}
              onPress={() => onClaim(item)}
            >
              <Text style={s.btnText}>{claiming === item.id ? 'กำลังแลก...' : 'แลกเลย'}</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  title: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginVertical: 12 },
  open: { backgroundColor: '#D1FAE5' },
  closed: { backgroundColor: '#FEE2E2' },
  badgeText: { fontWeight: '700', fontSize: 13 },
  card: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 16, marginBottom: 12, gap: 6 },
  name: { fontSize: 17, fontWeight: '800' },
  desc: { color: theme.textMuted, fontSize: 13 },
  price: { fontWeight: '700', color: theme.greenDark },
  btn: { backgroundColor: theme.green, borderRadius: theme.radius, padding: 12, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: '#ccc' },
  btnText: { color: '#fff', fontWeight: '700' },
});
