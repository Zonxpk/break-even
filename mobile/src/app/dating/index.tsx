import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { createMatch, fetchPersonas } from '../../api/personas';
import { supabase } from '../../lib/supabase';
import { XP, tierForXp } from '../../balance/balance';
import { deckForToday } from '../../dating/deck';
import { resolveSwipe } from '../../dating/swipe';
import { useAuth } from '../../state/auth';
import { theme } from '../../ui/theme';
import type { Persona } from '../../types/db';

export default function DatingDeck() {
  const router = useRouter();
  const { profile, userId, refreshProfile } = useAuth();
  const [deck, setDeck] = useState<Persona[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetchPersonas().then((all) => setDeck(deckForToday(all, userId))).catch(() => {});
  }, [userId]);

  const current = deck[index];

  async function swipe(direction: 'left' | 'right') {
    if (!current || !profile || !userId) return;
    const seed = current.id.charCodeAt(0) + index;

    if (direction === 'left') {
      const { data: prof } = await supabase.from('profiles').select('loyalty_xp').eq('id', userId).single();
      if (prof) {
        const xp = prof.loyalty_xp + XP.swipe_rejected;
        await supabase.from('profiles').update({ loyalty_xp: xp, tier: tierForXp(xp) }).eq('id', userId);
        refreshProfile();
      }
      Alert.alert('เขาปัดซ้ายคุณ 💔', '+2 แต้มความเจ็บปวด');
    } else {
      const result = resolveSwipe({ tier: profile.tier, rarity: current.rarity, seed });
      if (result === 'match') {
        await createMatch(current.id);
        Alert.alert('แมตช์แล้ว! 💘', `คุณกับ ${current.name} ชอบกัน`);
        router.push('/dating/matches');
        return;
      }
      Alert.alert('ยังไม่แมตช์', 'วันนี้ยังไม่ใช่คู่แท้');
    }
    setIndex((i) => i + 1);
  }

  if (!current) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ headerShown: true, title: '💘 หาคู่' }} />
        <Text style={s.empty}>มือหมดแล้ว — พรุ่งนี้มีคนใหม่มาให้ผิดหวัง</Text>
        <Pressable onPress={() => router.push('/dating/matches')}>
          <Text style={s.link}>ดูแมตช์ของฉัน</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: '💘 หาคู่' }} />
      <View style={s.card}>
        <Text style={s.photo}>📸</Text>
        <Text style={s.name}>{current.name}</Text>
        <Text style={s.bio}>{current.bio}</Text>
        <Text style={s.rarity}>{current.rarity}</Text>
      </View>
      <View style={s.actions}>
        <Pressable style={[s.btn, s.nope]} onPress={() => swipe('left')}><Text>✕</Text></Pressable>
        <Pressable style={[s.btn, s.yes]} onPress={() => swipe('right')}><Text>♥</Text></Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.pad, gap: 12 },
  card: { backgroundColor: theme.surface, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, minHeight: 320 },
  photo: { fontSize: 64 },
  name: { fontSize: 24, fontWeight: '800' },
  bio: { textAlign: 'center', color: theme.textMuted, lineHeight: 22 },
  rarity: { fontSize: 12, fontWeight: '700', color: theme.greenDark, textTransform: 'uppercase' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginTop: 24 },
  btn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  nope: { backgroundColor: '#FEE2E2' },
  yes: { backgroundColor: '#FECDD3' },
  empty: { textAlign: 'center', color: theme.textMuted },
  link: { color: theme.greenDark, fontWeight: '700' },
});
