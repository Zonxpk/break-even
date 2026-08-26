import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMatch, fetchPersonas } from '../../api/personas';
import { awardProgress } from '../../api/progress';
import { deckForToday } from '../../dating/deck';
import { fakeDistanceKm } from '../../dating/distanceJoke';
import { resolveSwipe } from '../../dating/swipe';
import TinderActionBar from '../../dating/ui/TinderActionBar';
import TinderDeck, { type SwipeDirection } from '../../dating/ui/TinderDeck';
import { useAuth } from '../../state/auth';
import { theme } from '../../ui/theme';
import type { Persona } from '../../types/db';

export default function DatingDeck() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, userId, refreshProfile } = useAuth();
  const [deck, setDeck] = useState<Persona[]>([]);
  const [swipedCount, setSwipedCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [swipeRequest, setSwipeRequest] = useState<SwipeDirection | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!userId) return;
    fetchPersonas().then((all) => setDeck(deckForToday(all, userId))).catch(() => {});
  }, [userId]);

  async function handleSwipe(direction: SwipeDirection, persona: Persona) {
    if (!profile || !userId || busy) return;
    setBusy(true);
    const index = swipedCount;
    const seed = persona.id.charCodeAt(0) + index;
    const isSuper = direction === 'super';

    try {
      if (direction === 'left') {
        await awardProgress('swipe_rejected').catch(() => null);
        refreshProfile();
        Alert.alert('เขาปัดซ้ายคุณ 💔', '+2 แต้มความเจ็บปวด');
      } else {
        if (isSuper) {
          Alert.alert('ซุปเปอร์ไลค์! ⭐', `${persona.name} ไม่เห็นหรอก แต่คุณรู้สึกดีใช่ไหม`);
        }
        const result = resolveSwipe({ tier: profile.tier, rarity: persona.rarity, seed });
        if (result === 'match') {
          await createMatch(persona.id);
          Alert.alert('แมตช์แล้ว! 💘', `คุณกับ ${persona.name} ชอบกัน`);
          router.push('/dating/matches');
          return;
        }
        Alert.alert('ยังไม่แมตช์', 'วันนี้ยังไม่ใช่คู่แท้');
      }
      setSwipedCount((n) => n + 1);
      setDeck((d) => d.slice(1));
    } finally {
      setBusy(false);
    }
  }

  function requestSwipe(dir: SwipeDirection) {
    if (busy || deck.length === 0) return;
    setSwipeRequest(dir);
  }

  const empty = deck.length === 0;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={s.header}>
        <Text style={s.logo}>💘</Text>
        <Text style={s.title}>หาคู่</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ดูแมตช์ของฉัน"
          onPress={() => router.push('/dating/matches')}
          style={({ pressed }) => [s.matchesBtn, pressed && s.matchesBtnPressed]}
        >
          <Text style={s.matchesIcon}>💬</Text>
        </Pressable>
      </View>

      {!empty ? (
        <Text style={s.progress}>วันนี้ปัดไปแล้ว {swipedCount}/10</Text>
      ) : null}

      <View style={s.deckArea}>
        {empty ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🔥</Text>
            <Text style={s.emptyTitle}>ไม่มีคนให้ปัดแล้ว</Text>
            <Text style={s.emptySub}>พรุ่งนี้มีคนใหม่มาให้ผิดหวัง — หรือไปดูแมตช์เก่า</Text>
            <Pressable onPress={() => router.push('/dating/matches')} style={s.emptyBtn}>
              <Text style={s.emptyBtnText}>ดูแมตช์ของฉัน</Text>
            </Pressable>
          </View>
        ) : (
          <TinderDeck
            cards={deck}
            distanceFor={(p) => fakeDistanceKm(p.id, today)}
            onSwipe={handleSwipe}
            swipeRequest={swipeRequest}
            onSwipeRequestHandled={() => setSwipeRequest(null)}
          />
        )}
      </View>

      {!empty ? (
        <View style={[s.actions, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TinderActionBar onSwipe={requestSwipe} disabled={busy} />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.pad,
    paddingVertical: 10,
    gap: 8,
  },
  logo: { fontSize: 26 },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: theme.tinder.pink },
  matchesBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchesBtnPressed: { opacity: 0.7 },
  matchesIcon: { fontSize: 20 },
  progress: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 4,
  },
  deckArea: { flex: 1, paddingHorizontal: 12, paddingBottom: 8 },
  actions: { paddingHorizontal: theme.pad, paddingTop: 4 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: '800' },
  emptySub: { textAlign: 'center', color: theme.textMuted, lineHeight: 22 },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: theme.tinder.pink,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
