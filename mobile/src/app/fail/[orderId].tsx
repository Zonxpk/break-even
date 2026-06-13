import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { failOrder, getOrder, type FailResult } from '../../api/orders';
import { appendApology } from '../../dating/chatStorage';
import { useAuth } from '../../state/auth';
import { supabase } from '../../lib/supabase';
import { theme } from '../../ui/theme';

export default function Fail() {
  const { orderId, kind } = useLocalSearchParams<{ orderId: string; kind: string }>();
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [result, setResult] = useState<FailResult | null>(null);
  const [campaignTitle, setCampaignTitle] = useState<string>('');

  useEffect(() => {
    (async () => {
      const order = await getOrder(orderId!);
      const items = order.items_json as Array<{ match_id?: string; persona_id?: string; persona_name?: string }>;
      const matchId = items[0]?.match_id;
      const personaName = items[0]?.persona_name ?? 'เขา';
      const r = await failOrder(order, kind ?? 'lost', { personaId: items[0]?.persona_id }).catch(() => ({ voucher: null, rateLimited: false }));
      if (order.service === 'date' && matchId) {
        await appendApology(matchId, personaName, 'ขอโทษนะ วันนี้ไปไม่ถึงจริงๆ แต่ยังคุยกันได้นะ 💔');
      }
      if (r.voucher) {
        const { data } = await supabase
          .from('voucher_campaigns')
          .select('title')
          .eq('id', r.voucher.campaign_id)
          .single();
        setCampaignTitle(data?.title ?? 'คูปองปลอบใจ');
      }
      setResult(r);
      refreshProfile();
    })();
  }, [orderId]);

  if (!result) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={theme.green} size="large" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={s.splash}>🛶</Text>
      <Text style={s.headline}>{finaleHeadline(kind ?? 'lost')}</Text>
      <Text style={s.sub}>ขออภัยในความไม่สะดวก (อีกแล้ว)</Text>

      {result.voucher ? (
        <View style={s.voucher}>
          <Text style={s.voucherLabel}>🎟️ คูปองปลอบใจจากพาร์ทเนอร์</Text>
          <Text style={s.voucherTitle}>{campaignTitle}</Text>
          {result.voucher.code ? <Text style={s.voucherCode}>{result.voucher.code}</Text> : null}
        </View>
      ) : result.rateLimited ? (
        <Text style={s.rateLimited}>ความเสียใจของคุณถี่เกินระบบจะปลอบไหว 🙏{'\n'}พักสักครู่แล้วค่อยผิดหวังใหม่</Text>
      ) : (
        <Text style={s.rateLimited}>ครั้งนี้ไม่มีคูปอง แต่มีความทรงจำ</Text>
      )}

      <Pressable style={s.cta} onPress={() => router.replace('/(tabs)/vouchers')}>
        <Text style={s.ctaText}>ดูคูปองของฉัน</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/')}>
        <Text style={s.again}>สั่งใหม่ (เผื่อรอบนี้จะถึง)</Text>
      </Pressable>
    </View>
  );
}

function finaleHeadline(kind: string): string {
  switch (kind) {
    case 'canal': return 'ไรเดอร์ตกคลอง';
    case 'sleepy': return 'ไรเดอร์หลับลึกเกินปลุก';
    case 'lost': return 'ไรเดอร์หลงทางถาวร';
    default: return 'ออเดอร์ไปไม่ถึงฝั่งฝัน';
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E2A47', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E2A47' },
  splash: { fontSize: 72 },
  headline: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center' },
  sub: { color: '#9FB8D0', marginBottom: 18 },
  voucher: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', gap: 6, width: '100%' },
  voucherLabel: { fontSize: 12, color: theme.textMuted },
  voucherTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  voucherCode: { fontSize: 20, fontWeight: '900', letterSpacing: 2, color: theme.greenDark, marginTop: 6 },
  rateLimited: { color: '#9FB8D0', textAlign: 'center', lineHeight: 22 },
  cta: { backgroundColor: theme.green, borderRadius: theme.radius, padding: 16, alignItems: 'center', width: '100%', marginTop: 20 },
  ctaText: { color: '#fff', fontWeight: '700' },
  again: { color: '#9FB8D0', padding: 10 },
});
