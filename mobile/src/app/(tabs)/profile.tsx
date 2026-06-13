import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchBrandMemberships } from '../../api/shop';
import { setLlmApiKey } from '../../dating/llm';
import { useAuth } from '../../state/auth';
import { TIERS } from '../../balance/balance';
import { theme } from '../../ui/theme';

const TIER_BADGE: Record<string, string> = { silver: '🥈', gold: '🥇', platinum: '💎', vip: '👑' };
const TIER_LABEL: Record<string, string> = {
  silver: 'Silver — ผู้เริ่มผิดหวัง', gold: 'Gold — ผู้ผิดหวังเป็นนิจ',
  platinum: 'Platinum — ผู้เชี่ยวชาญการรอ', vip: 'VIP — ตำนานแห่งความว่างเปล่า',
};

export default function Profile() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [isBrand, setIsBrand] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetchBrandMemberships().then((m) => setIsBrand(m.length > 0)).catch(() => {});
  }, []);

  if (!profile) return null;

  const nextTier = TIERS.find((t) => t.minXp > profile.loyalty_xp);

  return (
    <View style={s.root}>
      <Text style={s.title}>โปรไฟล์</Text>
      <View style={s.card}>
        <Text style={s.name}>{profile.nickname ?? 'ลูกค้านิรนาม'}</Text>
        <Text style={s.tier}>
          {TIER_BADGE[profile.tier]} {TIER_LABEL[profile.tier]}
        </Text>
        <Text style={s.xp}>
          {profile.loyalty_xp} แต้มความเจ็บปวด
          {nextTier ? ` · อีก ${nextTier.minXp - profile.loyalty_xp} แต้มถึงระดับถัดไป` : ' · สุดทางแล้ว'}
        </Text>
      </View>

      <Pressable style={s.row} onPress={() => router.push('/partner')}>
        <Text style={s.rowText}>🤝 ร่วมเป็นพาร์ทเนอร์กับเรา</Text>
      </Pressable>
      {isBrand ? (
        <Pressable style={s.row} onPress={() => router.push('/brand')}>
          <Text style={s.rowText}>🏪 จัดการร้าน (แบรนด์โหมด)</Text>
        </Pressable>
      ) : null}
      <View style={s.llmBox}>
        <Text style={s.llmLabel}>เชื่อมต่อ AI (BYO API key)</Text>
        <TextInput
          style={s.llmInput}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="sk-..."
          secureTextEntry
          autoCapitalize="none"
        />
        <Pressable
          style={s.llmSave}
          onPress={async () => {
            await setLlmApiKey(apiKey);
            Alert.alert('บันทึกแล้ว', 'จะใช้ AI แชทเมื่อมีคีย์ — ไม่มีก็ใช้บทสนทนาสำเร็จรูป');
          }}
        >
          <Text style={s.llmSaveText}>บันทึกคีย์</Text>
        </Pressable>
      </View>
      <Pressable style={s.row} onPress={() => signOut()}>
        <Text style={[s.rowText, { color: theme.danger }]}>ออกจากระบบ</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  title: { fontSize: 22, fontWeight: '800', marginTop: 40, marginBottom: 14 },
  card: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 18, gap: 6, marginBottom: 18 },
  name: { fontSize: 18, fontWeight: '800' },
  tier: { fontSize: 15, fontWeight: '600' },
  xp: { fontSize: 13, color: theme.textMuted },
  row: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowText: { fontSize: 15, fontWeight: '600' },
  llmBox: { marginTop: 12, gap: 8 },
  llmLabel: { fontSize: 13, fontWeight: '600', color: theme.textMuted },
  llmInput: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 12 },
  llmSave: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 12, alignItems: 'center' },
  llmSaveText: { fontWeight: '700', color: theme.greenDark },
});
