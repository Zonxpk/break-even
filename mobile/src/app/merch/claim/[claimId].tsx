import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getClaim } from '../../../api/shop';
import { theme } from '../../../ui/theme';

export default function ClaimDetail() {
  const { claimId } = useLocalSearchParams<{ claimId: string }>();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    getClaim(claimId!).then((row: Awaited<ReturnType<typeof getClaim>>) => {
      setCode(row.redemption_code);
      setInstructions(row.merch_items?.redemption_instructions ?? 'แสดงโค้ดที่บูธงาน');
    }).catch(() => {});
  }, [claimId]);

  if (!code) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={theme.green} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: 'โค้ดแลกของ' }} />
      <Text style={s.label}>โค้ดของคุณ</Text>
      <Text style={s.code}>{code}</Text>
      <Text style={s.hint}>{instructions}</Text>
      <Pressable style={s.cta} onPress={() => router.replace('/(tabs)/vouchers')}>
        <Text style={s.ctaText}>ไปดูในคูปอง</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad, alignItems: 'center', justifyContent: 'center', gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { color: theme.textMuted },
  code: { fontSize: 28, fontWeight: '900', letterSpacing: 3, color: theme.greenDark },
  hint: { textAlign: 'center', color: theme.textMuted, lineHeight: 22 },
  cta: { backgroundColor: theme.green, borderRadius: theme.radius, padding: 14, paddingHorizontal: 24, marginTop: 20 },
  ctaText: { color: '#fff', fontWeight: '700' },
});
