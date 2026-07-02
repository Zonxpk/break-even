import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchPromoCampaigns } from '../../api/content';
import { fetchActiveShops } from '../../api/shop';
import { useAuth } from '../../state/auth';
import { formatCountdown, isShopOpen, msUntilNextOpen } from '../../shop/schedule';
import { theme } from '../../ui/theme';
import { PaperBackground } from '../../ui/doodle/PaperBackground';
import { Sketch } from '../../ui/doodle/Sketch';
import type { ShopRow, VoucherCampaign } from '../../types/db';

const SERVICES = [
  { key: 'food', label: 'อาหาร', glyph: '🍜', route: '/order/food' as const },
  { key: 'ride', label: 'เรียกรถ', glyph: '🏍️' },
  { key: 'parcel', label: 'ส่งพัสดุ', glyph: '📦' },
  { key: 'mart', label: 'มาร์ท', glyph: '🛒' },
  { key: 'dating', label: 'หาคู่', glyph: '💘', route: '/dating' as const },
] as const;

// per-tile doodle wash + tilt, cycling like the prototype's .svc:nth-child rules
const TILE_WASH = [
  theme.doodle.coralWash,
  theme.doodle.blueWash,
  theme.doodle.mintWash,
  theme.doodle.yellowWash,
  theme.doodle.card,
];
const TILE_TILT = ['-1.4deg', '0.8deg', '-0.6deg', '1.2deg', '-1deg'];

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
    <View style={s.root}>
      <PaperBackground />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <View style={s.tags}>
          <Text style={[s.tag, s.tagMint]}>เริ่ด!</Text>
          <Text style={[s.tag, s.tagCoral]}>หายใจๆๆๆ</Text>
        </View>
        <Text style={s.title} testID="greeting">
          โอ๊ย! ปลื้ม {profile?.nickname ?? 'คุณลูกค้า'} มาอีกแล้วเหรอ 👋
        </Text>
        <Text style={s.sub}>
          ที่พักของคนที่ <Text style={s.highlight}>ลืมพัก</Text> — วันนี้อยากให้อะไรไปไม่ถึงดี?
        </Text>

        <View style={s.grid}>
          {SERVICES.map((svc, i) => (
            <Pressable
              key={svc.key}
              style={[s.tileWrap, { transform: [{ rotate: TILE_TILT[i] }] }]}
              testID={`svc-${svc.key}`}
              onPress={() => router.push('route' in svc ? svc.route : `/order/${svc.key}`)}
            >
              <Sketch style={s.tile} fill={TILE_WASH[i]} seed={i + 1} radius={18}>
                <View style={s.tileInner}>
                  <Text style={s.tileGlyph}>{svc.glyph}</Text>
                  <Text style={s.tileLabel}>{svc.label}</Text>
                </View>
              </Sketch>
            </Pressable>
          ))}
        </View>

        <Sketch style={s.note} fill={theme.doodle.paper2} stroke={theme.doodle.grape} dashed seed={42} radius={16}>
          <View style={s.noteInner}>
            <Text style={s.noteArrow}>↩︎</Text>
            <Text style={s.noteText}>
              โอ๊ย นี่พัก หรือหนีงานมาดองในนี้เนี่ย? เอาน่า สั่งเลย เดี๋ยวมัน (ไม่) มาเอง
            </Text>
          </View>
        </Sketch>

        <Text style={s.section}>ร้าน merch ป๊อปอัพ</Text>
        <Pressable onPress={() => router.push('/merch')}>
          <Sketch style={s.card} fill={theme.doodle.yellowWash} seed={7} radius={18} shadow>
            <View style={s.merchRow}>
              <Text style={s.merchTitle}>🎁 {shop?.name ?? 'ร้านป๊อปอัพ'}</Text>
              <Text style={[s.pill, merchOpen ? s.pillOpen : s.pillClosed]}>
                {merchOpen ? 'เปิดอยู่!' : merchCountdown || 'ปิดอยู่'}
              </Text>
            </View>
          </Sketch>
        </Pressable>

        <Text style={s.section}>โปรโมชั่นพาร์ทเนอร์</Text>
        {promos.map((p, i) => (
          <Sketch key={p.id} style={s.card} fill={theme.doodle.card} seed={20 + i} radius={16}>
            <View style={s.promoInner}>
              <Text style={s.promoTitle}>{p.title}</Text>
              {p.terms ? <Text style={s.promoTerms}>{p.terms}</Text> : null}
            </View>
          </Sketch>
        ))}

        <Pressable onPress={() => router.push('/order/food')}>
          <Sketch style={s.cta} fill={theme.doodle.coral} stroke={theme.doodle.ink} strokeWidth={3} seed={99} radius={18} shadow>
            <Text style={s.ctaText}>สั่งของที่ไม่มีวันถึง →</Text>
          </Sketch>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper },
  scroll: { flex: 1 },
  content: { padding: theme.pad, paddingTop: 48, paddingBottom: 32 },

  tags: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tag: {
    fontFamily: theme.fontBold, fontSize: 13, color: theme.doodle.ink,
    borderWidth: 2.5, borderColor: theme.doodle.ink, borderRadius: 14,
    paddingHorizontal: 11, paddingVertical: 3, overflow: 'hidden',
  },
  tagMint: { backgroundColor: theme.doodle.mint, color: '#234234', transform: [{ rotate: '-2.5deg' }] },
  tagCoral: { backgroundColor: theme.doodle.coral, color: '#fff', transform: [{ rotate: '1.5deg' }] },

  title: { fontFamily: theme.fontBold, fontSize: 23, color: theme.doodle.ink, lineHeight: 30, marginTop: 4 },
  sub: { fontFamily: theme.font, fontSize: 14, color: theme.doodle.inkSoft, marginTop: 6, marginBottom: 18 },
  highlight: { fontFamily: theme.fontBold, color: theme.doodle.ink, backgroundColor: theme.doodle.yellow },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tileWrap: { width: '31%' },
  tile: { width: '100%' },
  tileInner: { paddingVertical: 16, paddingHorizontal: 4, alignItems: 'center', gap: 6 },
  tileGlyph: { fontSize: 30 },
  tileLabel: { fontFamily: theme.fontBold, fontSize: 13, color: theme.doodle.ink },

  note: { marginTop: 16, transform: [{ rotate: '-0.5deg' }] },
  noteInner: { padding: 13, flexDirection: 'row', gap: 8 },
  noteArrow: { fontFamily: theme.fontBold, fontSize: 18, color: theme.doodle.grape },
  noteText: { flex: 1, fontFamily: theme.fontBold, fontSize: 14, color: theme.doodle.ink, lineHeight: 20 },

  section: { fontFamily: theme.fontBold, fontSize: 16, color: theme.doodle.ink, marginTop: 26, marginBottom: 10 },

  card: { marginBottom: 10 },
  merchRow: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  merchTitle: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink, flex: 1 },
  pill: {
    fontFamily: theme.fontBold, fontSize: 12, overflow: 'hidden',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    borderWidth: 2, borderColor: theme.doodle.ink,
  },
  pillOpen: { backgroundColor: theme.doodle.mint, color: '#234234' },
  pillClosed: { backgroundColor: theme.doodle.coralWash, color: theme.doodle.coral },

  promoInner: { padding: 14 },
  promoTitle: { fontFamily: theme.fontBold, fontSize: 14, color: theme.doodle.ink },
  promoTerms: { fontFamily: theme.font, color: theme.doodle.inkSoft, fontSize: 12, marginTop: 4 },

  cta: { marginTop: 18, transform: [{ rotate: '-0.6deg' }] },
  ctaText: {
    fontFamily: theme.fontBold, fontSize: 17, color: '#fff',
    textAlign: 'center', paddingVertical: 16, paddingHorizontal: 14,
  },
});
