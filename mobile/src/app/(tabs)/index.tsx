import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchPromoCampaigns } from '../../api/content';
import { fetchActiveShops } from '../../api/shop';
import { useAuth } from '../../state/auth';
import { formatCountdown, isShopOpen, msUntilNextOpen } from '../../shop/schedule';
import { theme } from '../../ui/theme';
import type { ShopRow, VoucherCampaign } from '../../types/db';

const SERVICES = [
  { key: 'food', label: 'อาหาร', glyph: '🍜', route: '/order/food' as const },
  { key: 'ride', label: 'เรียกรถ', glyph: '🏍️' },
  { key: 'parcel', label: 'ส่งพัสดุ', glyph: '📦' },
  { key: 'mart', label: 'มาร์ท', glyph: '🛒' },
  { key: 'dating', label: 'หาคู่', glyph: '💘', route: '/dating' as const },
] as const;

export default function Home() {
  const router = useRouter();
  const { profile } = useAuth();
  const [promos, setPromos] = useState<VoucherCampaign[]>([]);
  const [shop, setShop] = useState<ShopRow | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchPromoCampaigns().then(setPromos).catch(() => {});
    fetchActiveShops().then((shops) => setShop(shops[0] ?? null)).catch(() => {});
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const merchOpen = shop ? isShopOpen(shop.schedule, now) : false;
  const merchCountdown = shop && !merchOpen ? formatCountdown(msUntilNextOpen(shop.schedule, now)) : '';

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: theme.pad }}>
      <Text style={s.hello} testID="greeting">
        สวัสดี {profile?.nickname ?? 'คุณลูกค้า'} 👋
      </Text>
      <Text style={s.tagline}>วันนี้อยากให้อะไรไปไม่ถึงดี?</Text>

      <View style={s.grid}>
        {SERVICES.map((svc) => (
          <Pressable
            key={svc.key}
            style={s.tile}
            testID={`svc-${svc.key}`}
            onPress={() => router.push('route' in svc ? svc.route : `/order/${svc.key}`)}
          >
            <Text style={s.tileGlyph}>{svc.glyph}</Text>
            <Text style={s.tileLabel}>{svc.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.section}>ร้าน merch ป๊อปอัพ</Text>
      <Pressable style={s.merchTeaser} onPress={() => router.push('/merch')}>
        <View style={s.merchRow}>
          <Text style={s.merchTitle}>🎁 {shop?.name ?? 'ร้านป๊อปอัพ'}</Text>
          <Text style={[s.merchPill, merchOpen ? s.pillOpen : s.pillClosed]}>
            {merchOpen ? 'เปิดอยู่!' : merchCountdown || 'ปิดอยู่'}
          </Text>
        </View>
      </Pressable>

      <Text style={s.section}>โปรโมชั่นพาร์ทเนอร์</Text>
      {promos.map((p) => (
        <View key={p.id} style={s.promo}>
          <Text style={s.promoTitle}>{p.title}</Text>
          {p.terms ? <Text style={s.promoTerms}>{p.terms}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  hello: { fontSize: 22, fontWeight: '700', color: theme.text, marginTop: 40 },
  tagline: { fontSize: 14, color: theme.textMuted, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%', backgroundColor: theme.surface, borderRadius: theme.radius,
    padding: 20, alignItems: 'center', gap: 8,
  },
  tileGlyph: { fontSize: 36 },
  tileLabel: { fontSize: 16, fontWeight: '600', color: theme.text },
  section: { fontSize: 16, fontWeight: '700', marginTop: 28, marginBottom: 10, color: theme.text },
  promo: { backgroundColor: '#E8F7EE', borderRadius: theme.radius, padding: 14, marginBottom: 10 },
  promoTitle: { fontWeight: '700', color: theme.greenDark },
  promoTerms: { color: theme.textMuted, fontSize: 12, marginTop: 4 },
  merchTeaser: { backgroundColor: '#FFF8E7', borderRadius: theme.radius, padding: 14, marginBottom: 8 },
  merchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  merchTitle: { fontWeight: '700', flex: 1 },
  merchPill: { fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillOpen: { backgroundColor: '#D1FAE5', color: theme.greenDark },
  pillClosed: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
});
