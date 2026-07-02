import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchBrandMemberships } from '../../api/shop';
import { setLlmApiKey } from '../../dating/llm';
import { useAuth } from '../../state/auth';
import { TIERS } from '../../balance/balance';
import { theme } from '../../ui/theme';
import { PaperBackground } from '../../ui/doodle/PaperBackground';
import { Sketch } from '../../ui/doodle/Sketch';

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
      <PaperBackground />
      <Text style={s.title}>โปรไฟล์</Text>

      <Sketch style={s.card} fill={theme.doodle.yellowWash} seed={3} radius={18} shadow>
        <View style={s.cardInner}>
          <Text style={s.name}>{profile.nickname ?? 'ลูกค้านิรนาม'}</Text>
          <Text style={s.tier}>
            {TIER_BADGE[profile.tier]} {TIER_LABEL[profile.tier]}
          </Text>
          <Text style={s.xp}>
            {profile.loyalty_xp} แต้มความเจ็บปวด
            {nextTier ? ` · อีก ${nextTier.minXp - profile.loyalty_xp} แต้มถึงระดับถัดไป` : ' · สุดทางแล้ว'}
          </Text>
        </View>
      </Sketch>

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
        <Sketch style={s.llmInputWrap} fill={theme.doodle.card} seed={11} radius={12}>
          <TextInput
            style={s.llmInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            placeholderTextColor={theme.doodle.inkSoft}
            secureTextEntry
            autoCapitalize="none"
          />
        </Sketch>
        <Pressable
          onPress={async () => {
            await setLlmApiKey(apiKey);
            Alert.alert('บันทึกแล้ว', 'จะใช้ AI แชทเมื่อมีคีย์ — ไม่มีก็ใช้บทสนทนาสำเร็จรูป');
          }}
        >
          <Sketch style={s.llmSave} fill={theme.doodle.coral} stroke={theme.doodle.ink} strokeWidth={3} seed={12} radius={14}>
            <Text style={s.llmSaveText}>บันทึกคีย์</Text>
          </Sketch>
        </Pressable>
      </View>

      <Pressable style={s.row} onPress={() => signOut()}>
        <Text style={[s.rowText, { color: theme.doodle.coral }]}>ออกจากระบบ</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.doodle.paper, padding: theme.pad },
  title: { fontFamily: theme.fontBold, fontSize: 22, color: theme.doodle.ink, marginTop: 40, marginBottom: 14 },
  card: { marginBottom: 18 },
  cardInner: { padding: 18, gap: 6 },
  name: { fontFamily: theme.fontBold, fontSize: 18, color: theme.doodle.ink },
  tier: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink },
  xp: { fontFamily: theme.font, fontSize: 13, color: theme.doodle.inkSoft },
  row: { paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: theme.doodle.grid, borderStyle: 'dashed' },
  rowText: { fontFamily: theme.fontBold, fontSize: 15, color: theme.doodle.ink },
  llmBox: { marginTop: 12, gap: 8 },
  llmLabel: { fontFamily: theme.fontBold, fontSize: 13, color: theme.doodle.inkSoft },
  llmInputWrap: {},
  llmInput: { fontFamily: theme.font, padding: 12, color: theme.doodle.ink },
  llmSave: { alignItems: 'center' },
  llmSaveText: { fontFamily: theme.fontBold, color: '#fff', paddingVertical: 12 },
});
