import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { listVouchers } from '../../api/orders';
import { listMyClaims } from '../../api/shop';
import { theme } from '../../ui/theme';
import { PaperBackground } from '../../ui/doodle/PaperBackground';
import { Sketch } from '../../ui/doodle/Sketch';

type VoucherRow = Awaited<ReturnType<typeof listVouchers>>[number];
type ClaimRow = Awaited<ReturnType<typeof listMyClaims>>[number];

export default function Vouchers() {
  const [rows, setRows] = useState<VoucherRow[]>([]);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    listVouchers().then(setRows).catch(() => {});
    listMyClaims().then(setClaims).catch(() => {});
  }, []);

  useFocusEffect(load);

  return (
    <View style={s.root}>
      <PaperBackground />
      <Text style={s.title}>คูปองของฉัน</Text>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); setRefreshing(false); }} />}
        ListHeaderComponent={
          claims.length ? (
            <View style={s.claimsSection}>
              <Text style={s.sectionTitle}>ของที่แลกแล้ว</Text>
              {claims.map((c, i) => (
                <Sketch key={c.id} style={s.card} fill={theme.doodle.mintWash} seed={i + 1} radius={18}>
                  <View style={s.cardInner}>
                    <Text style={s.cardTitle}>{c.merch_items?.name ?? 'สินค้า merch'}</Text>
                    <Text style={s.code}>{c.redemption_code}</Text>
                    <Text style={s.status}>{claimStatus(c.status)}</Text>
                  </View>
                </Sketch>
              ))}
              <Text style={[s.sectionTitle, { marginTop: 16 }]}>คูปอง</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={<Text style={s.empty}>ยังไม่มีคูปอง — ลองสั่งอะไรสักอย่างสิ รับรองผิดหวัง</Text>}
        renderItem={({ item, index }) => (
          <Sketch
            style={[s.card, item.status !== 'active' && { opacity: 0.45 }]}
            fill={theme.doodle.yellowWash}
            stroke={theme.doodle.ink}
            dashed
            seed={50 + index}
            radius={14}
          >
            <View style={s.cardInner}>
              <Text style={s.cardTitle}>{item.voucher_campaigns?.title}</Text>
              {item.code ? <Text style={s.code}>{item.code}</Text> : null}
              {item.voucher_campaigns?.redeem_info ? <Text style={s.terms}>{item.voucher_campaigns.redeem_info}</Text> : null}
              <Text style={s.status}>{statusText(item.status)}</Text>
            </View>
          </Sketch>
        )}
      />
    </View>
  );
}

function statusText(status: string): string {
  switch (status) {
    case 'active': return 'พร้อมใช้';
    case 'spent': return 'ใช้แลกของแล้ว';
    case 'redeemed': return 'ใช้แล้ว';
    default: return 'หมดอายุ';
  }
}

function claimStatus(status: string): string {
  switch (status) {
    case 'claimed': return 'รอรับของ';
    case 'redeemed': return 'รับของแล้ว';
    default: return 'หมดอายุ';
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper, padding: theme.pad },
  title: { fontFamily: theme.fontBold, fontSize: 22, color: theme.doodle.ink, marginTop: 40, marginBottom: 14 },
  list: { paddingBottom: 24 },
  sectionTitle: { fontFamily: theme.fontBold, fontSize: 16, color: theme.doodle.ink, marginBottom: 10 },
  claimsSection: { marginBottom: 8 },
  empty: { fontFamily: theme.font, color: theme.doodle.inkSoft, textAlign: 'center', marginTop: 60 },
  card: { marginBottom: 10 },
  cardInner: { padding: 16, gap: 4 },
  cardTitle: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink },
  code: { fontFamily: theme.fontBold, fontSize: 18, letterSpacing: 2, color: theme.doodle.coral },
  terms: { fontFamily: theme.font, fontSize: 12, color: theme.doodle.inkSoft },
  status: { fontFamily: theme.font, fontSize: 12, color: theme.doodle.inkSoft, marginTop: 4 },
});
