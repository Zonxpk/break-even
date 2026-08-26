import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { failOrder, getOrder, type FailResult } from '../../api/orders';
import { appendApology } from '../../dating/chatStorage';
import { useAuth } from '../../state/auth';
import { supabase } from '../../lib/supabase';
import { theme } from '../../ui/theme';
import { PaperBackground } from '../../ui/doodle/PaperBackground';
import { Sketch } from '../../ui/doodle/Sketch';
import { CrayonCta } from '../../ui/doodle/CrayonCta';

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
      const r = await failOrder(order).catch(() => ({ voucher: null, rateLimited: false }));
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
        <PaperBackground />
        <ActivityIndicator color={theme.doodle.coral} size="large" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <PaperBackground />
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={s.splash}>🛶</Text>
      <Text style={s.headline}>{finaleHeadline(kind ?? 'lost')}{'\n'}พักครบแล้ว เริ่ด!</Text>
      <Text style={s.sub}>พอแล้วว เก่งมากก! กลับไปลุยต่อได้ อย่าติดใจล่ะ</Text>

      {result.voucher ? (
        <Sketch
          style={s.voucher}
          fill={theme.doodle.yellowWash}
          stroke={theme.doodle.ink}
          strokeWidth={3}
          dashed
          seed={8}
          radius={12}
          shadow
        >
          <View style={s.voucherInner}>
            <Text style={s.voucherTag}>คูปองปลอบใจ</Text>
            <Text style={s.voucherTitle}>{campaignTitle}</Text>
            {result.voucher.code ? (
              <View style={s.codeBox}>
                <Text style={s.code}>{result.voucher.code}</Text>
              </View>
            ) : null}
          </View>
        </Sketch>
      ) : result.rateLimited ? (
        <Text style={s.noVoucher}>ความเสียใจของคุณถี่เกินระบบจะปลอบไหว 🙏{'\n'}พักสักครู่แล้วค่อยผิดหวังใหม่</Text>
      ) : (
        <Text style={s.noVoucher}>ครั้งนี้ไม่มีคูปอง แต่มีความทรงจำ</Text>
      )}

      <CrayonCta
        label="กลับไปใช้ชีวิต"
        seed={99}
        style={s.cta}
        onPress={() => router.replace('/(tabs)/vouchers')}
      />
      <CrayonCta
        ghost
        label="สั่งใหม่ (รู้ว่าไม่ถึง)"
        seed={55}
        style={s.ctaGhost}
        onPress={() => router.replace('/')}
      />
    </View>
  );
}

function finaleHeadline(kind: string): string {
  switch (kind) {
    case 'canal': return 'ตกคลองแสนแสบ!';
    case 'sleepy': return 'ไรเดอร์หลับลึกเกินปลุก';
    case 'lost': return 'ไรเดอร์หลงทางถาวร';
    default: return 'ออเดอร์ไปไม่ถึงฝั่งฝัน';
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper, alignItems: 'stretch', justifyContent: 'center', padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.doodle.paper },
  splash: { fontSize: 56, textAlign: 'center', transform: [{ rotate: '-5deg' }], paddingBottom: 6 },
  headline: {
    fontFamily: theme.fontBold, fontSize: 24, color: theme.doodle.coral,
    textAlign: 'center', lineHeight: 32, paddingHorizontal: 18,
  },
  sub: {
    fontFamily: theme.fontBold, fontSize: 14, color: theme.doodle.inkSoft,
    textAlign: 'center', marginTop: 7, paddingHorizontal: 20,
  },
  voucher: { marginTop: 18, transform: [{ rotate: '-1deg' }] },
  voucherInner: { padding: 15, alignItems: 'center' },
  voucherTag: {
    fontFamily: theme.fontBold, fontSize: 13, color: '#fff',
    backgroundColor: theme.doodle.coral,
    borderWidth: 2.5, borderColor: theme.doodle.ink, borderRadius: 14,
    paddingHorizontal: 11, paddingVertical: 3, overflow: 'hidden',
    transform: [{ rotate: '1.5deg' }],
  },
  voucherTitle: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink, marginTop: 9, textAlign: 'center' },
  codeBox: {
    marginTop: 9, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 2.5, borderColor: theme.doodle.ink, borderRadius: 8,
    backgroundColor: theme.doodle.card,
  },
  code: { fontFamily: theme.fontBold, fontSize: 18, letterSpacing: 2, color: theme.doodle.coral },
  noVoucher: {
    fontFamily: theme.font, color: theme.doodle.inkSoft, textAlign: 'center',
    lineHeight: 22, marginTop: 16,
  },
  cta: { marginTop: 22 },
  ctaGhost: { marginTop: 12 },
});
