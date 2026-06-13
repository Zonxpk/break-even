import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchAnchors } from '../../../api/content';
import { getMatch, updateMatch } from '../../../api/personas';
import { applyBeatChoice, nextBeat } from '../../../dating/chat';
import { loadChat, replyToUser, type ChatMessage } from '../../../dating/chatStorage';
import { placeDateOrder } from '../../../dating/bookDate';
import { theme } from '../../../ui/theme';
import type { GagAnchor } from '../../../types/db';

export default function DatingChat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [match, setMatch] = useState<Awaited<ReturnType<typeof getMatch>> | null>(null);
  const [spots, setSpots] = useState<GagAnchor[]>([]);
  const [sending, setSending] = useState(false);

  const reload = useCallback(async () => {
    const m = await getMatch(matchId!);
    setMatch(m);
    setMessages(await loadChat(matchId!));
  }, [matchId]);

  useEffect(() => {
    reload().catch(() => {});
    fetchAnchors().then(setSpots).catch(() => {});
  }, [reload]);

  const beat = match?.personas ? nextBeat(match, match.personas) : null;

  async function send() {
    if (!input.trim() || !match?.personas) return;
    setSending(true);
    try {
      await replyToUser(matchId!, match.personas, input.trim());
      const affection = match.affection + 1;
      await updateMatch(matchId!, { affection });
      setInput('');
      await reload();
    } finally {
      setSending(false);
    }
  }

  async function onBeatChoice(idx: number) {
    if (!beat || !match?.personas) return;
    const delta = applyBeatChoice(beat, idx);
    const affection = Math.max(0, match.affection + delta);
    const beats_done = [...match.beats_done, beat.id];
    await updateMatch(matchId!, { affection, beats_done });
    await reload();
  }

  async function bookDate() {
    if (!match?.personas || match.affection < 30) {
      Alert.alert('ยังไม่พร้อม', 'คุยกันให้ชอบกันก่อนนะ (30%)');
      return;
    }
    const spot = spots[0];
    if (!spot) return;
    const order = await placeDateOrder({
      matchId: matchId!,
      personaId: match.persona_id,
      personaName: match.personas.name,
      spot,
    });
    router.push(`/track/${order.id}`);
  }

  if (!match) {
    return <View style={s.center}><ActivityIndicator color={theme.green} /></View>;
  }

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: match.personas?.name ?? 'แชท' }} />
      <Text style={s.bar}>ความชอบ {match.affection}%</Text>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: theme.pad, gap: 8 }}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.role === 'user' ? s.user : s.persona]}>
            <Text>{item.text}</Text>
          </View>
        )}
      />
      {beat ? (
        <View style={s.beat}>
          <Text style={s.beatScene}>{beat.scene}</Text>
          {beat.choices.map((c: { text: string }, i: number) => (
            <Pressable key={c.text} style={s.beatBtn} onPress={() => onBeatChoice(i)}>
              <Text>{c.text}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {match.affection >= 30 ? (
        <Pressable style={s.dateBtn} onPress={bookDate}>
          <Text style={s.dateBtnText}>📍 นัดเดท</Text>
        </Pressable>
      ) : null}
      <View style={s.inputRow}>
        <TextInput style={s.input} value={input} onChangeText={setInput} placeholder="พิมพ์ข้อความ..." />
        <Pressable style={s.send} onPress={send} disabled={sending}>
          <Text style={s.sendText}>ส่ง</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bar: { padding: theme.pad, fontWeight: '700', backgroundColor: theme.surface },
  bubble: { borderRadius: theme.radius, padding: 12, maxWidth: '85%' },
  user: { alignSelf: 'flex-end', backgroundColor: '#DCFCE7' },
  persona: { alignSelf: 'flex-start', backgroundColor: theme.surface },
  beat: { padding: theme.pad, gap: 8, backgroundColor: '#FFF7ED' },
  beatScene: { fontWeight: '700' },
  beatBtn: { backgroundColor: '#fff', borderRadius: theme.radius, padding: 12 },
  dateBtn: { margin: theme.pad, backgroundColor: theme.green, borderRadius: theme.radius, padding: 14, alignItems: 'center' },
  dateBtnText: { color: '#fff', fontWeight: '700' },
  inputRow: { flexDirection: 'row', padding: theme.pad, gap: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: theme.surface, borderRadius: theme.radius, paddingHorizontal: 12 },
  send: { backgroundColor: theme.green, borderRadius: theme.radius, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700' },
});
