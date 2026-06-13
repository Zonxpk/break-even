import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { createMatch, fetchPersonas } from '../../api/personas';
import { supabase } from '../../lib/supabase';
import { XP, tierForXp } from '../../balance/balance';
import { deckForToday } from '../../dating/deck';
import { fakeDistanceKm } from '../../dating/distanceJoke';
import { resolveSwipe } from '../../dating/swipe';
import { useAuth } from '../../state/auth';
import { theme } from '../../ui/theme';
import type { Persona, PersonaRarity } from '../../types/db';

const RARITY_STYLE: Record<PersonaRarity, { badge: object; badgeText: object; card?: object; namePrefix?: string }> = {
  common: { badge: {}, badgeText: { color: theme.greenDark } },
  rare: { badge: { backgroundColor: '#FEF3C7' }, badgeText: { color: '#92400E' } },
  legendary: {
    badge: { backgroundColor: '#FEF3C7' },
    badgeText: { color: '#92400E' },
    card: { borderWidth: 2, borderColor: theme.greenDark },
    namePrefix: '✨ ',
  },
};

export default function DatingDeck() {
  const router = useRouter();
  const { profile, userId, refreshProfile } = useAuth();
  const [deck, setDeck] = useState<Persona[]>([]);
  const [index, setIndex] = useState(0);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!userId) return;
    fetchPersonas().then((all) => setDeck(deckForToday(all, userId))).catch(() => {});
  }, [userId]);

  const current = deck[index];
  const rarity = current ? RARITY_STYLE[current.rarity] : null;

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
        <Text style={s.progress}>วันนี้ปัดไปแล้ว {index}/10</Text>
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
      {index > 0 ? <Text style={s.progress}>วันนี้ปัดไปแล้ว {index}/10</Text> : null}
      <View style={[s.card, rarity?.card]}>
        <Text style={s.photo}>📸</Text>
        <Text style={s.name}>{rarity?.namePrefix}{current.name}</Text>
        <Text style={s.bio}>{current.bio}</Text>
        <Text style={s.distance}>ห่างจากคุณ {fakeDistanceKm(current.id, today)}</Text>
        <Text style={[s.rarity, rarity?.badge, rarity?.badgeText]}>{current.rarity}</Text>
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
  progress: { textAlign: 'center', color: theme.textMuted, marginBottom: 8, fontSize: 13 },
  card: { backgroundColor: theme.surface, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, minHeight: 320 },
  photo: { fontSize: 64 },
  name: { fontSize: 24, fontWeight: '800' },
  bio: { textAlign: 'center', color: theme.textMuted, lineHeight: 22 },
  distance: { fontSize: 13, color: theme.textMuted },
  rarity: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginTop: 24 },
  btn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  nope: { backgroundColor: '#FEE2E2' },
  yes: { backgroundColor: '#FECDD3' },
  empty: { textAlign: 'center', color: theme.textMuted },
  link: { color: theme.greenDark, fontWeight: '700' },
});
