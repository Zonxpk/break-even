import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { listVouchers } from '../../api/orders';
import { listMyClaims } from '../../api/shop';
import { theme } from '../../ui/theme';

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
      <Text style={s.title}>คูปองของฉัน</Text>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); setRefreshing(false); }} />}
        ListHeaderComponent={
          claims.length ? (
            <View style={s.claimsSection}>
              <Text style={s.sectionTitle}>ของที่แลกแล้ว</Text>
              {claims.map((c) => (
                <View key={c.id} style={s.claimCard}>
                  <Text style={s.cardTitle}>{c.merch_items?.name ?? 'สินค้า merch'}</Text>
                  <Text style={s.code}>{c.redemption_code}</Text>
                  <Text style={s.status}>{claimStatus(c.status)}</Text>
                </View>
              ))}
              <Text style={[s.sectionTitle, { marginTop: 16 }]}>คูปอง</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={<Text style={s.empty}>ยังไม่มีคูปอง — ลองสั่งอะไรสักอย่างสิ รับรองผิดหวัง</Text>}
        renderItem={({ item }) => (
          <View style={[s.card, item.status !== 'active' && { opacity: 0.45 }]}>
            <Text style={s.cardTitle}>{item.voucher_campaigns?.title}</Text>
            {item.code ? <Text style={s.code}>{item.code}</Text> : null}
            {item.voucher_campaigns?.redeem_info ? <Text style={s.terms}>{item.voucher_campaigns.redeem_info}</Text> : null}
            <Text style={s.status}>{statusText(item.status)}</Text>
          </View>
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
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  title: { fontSize: 22, fontWeight: '800', marginTop: 40, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  claimsSection: { marginBottom: 8 },
  claimCard: { backgroundColor: '#F3F4F6', borderRadius: theme.radius, padding: 14, marginBottom: 8, gap: 4 },
  empty: { color: theme.textMuted, textAlign: 'center', marginTop: 60 },
  card: { backgroundColor: '#FFF8E7', borderRadius: theme.radius, padding: 16, marginBottom: 10, gap: 4 },
  cardTitle: { fontWeight: '800', fontSize: 15 },
  code: { fontSize: 18, fontWeight: '900', letterSpacing: 2, color: theme.greenDark },
  terms: { fontSize: 12, color: theme.textMuted },
  status: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
});
