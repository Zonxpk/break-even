import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchAnchors } from '../../../api/content';
import { getMatch, updateMatch } from '../../../api/personas';
import { awardProgress } from '../../../api/progress';
import { applyBeatChoice, nextBeat } from '../../../dating/chat';
import { chatAffectionGain } from '../../../dating/affectionDrip';
import { clearChatSession, loadChatSession, saveChatSession } from '../../../dating/chatSession';
import { loadChat, replyToUser, type ChatMessage } from '../../../dating/chatStorage';
import { placeDateOrder } from '../../../dating/bookDate';
import AffectionBar from '../../../dating/ui/AffectionBar';
import ChatBubble from '../../../dating/ui/ChatBubble';
import SpotPicker from '../../../ui/SpotPicker';
import { theme } from '../../../ui/theme';
import { useAuth } from '../../../state/auth';
import type { GagAnchor } from '../../../types/db';

export default function DatingChat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [match, setMatch] = useState<Awaited<ReturnType<typeof getMatch>> | null>(null);
  const [spots, setSpots] = useState<GagAnchor[]>([]);
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [spotsError, setSpotsError] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const reload = useCallback(async () => {
    const m = await getMatch(matchId!);
    setMatch(m);
    setMessages(await loadChat(matchId!));
  }, [matchId]);

  useEffect(() => {
    reload().catch(() => {});
    setSpotsLoading(true);
    fetchAnchors()
      .then((a) => { setSpots(a); setSpotsError(false); })
      .catch(() => setSpotsError(true))
      .finally(() => setSpotsLoading(false));
  }, [reload]);

  useEffect(() => () => {
    if (matchId) clearChatSession(matchId).catch(() => {});
  }, [matchId]);

  const beat = match?.personas ? nextBeat(match, match.personas) : null;
  const canSend = input.trim().length > 0 && !sending;

  async function grantBeatXp() {
    await awardProgress('story_beat').catch(() => null);
    refreshProfile();
  }

  async function send() {
    if (!canSend || !match?.personas || !matchId) return;
    setSending(true);
    try {
      await replyToUser(matchId, match.personas, input.trim());
      const session = await loadChatSession(matchId);
      session.userMsgCount += 1;
      const drip = chatAffectionGain(session.userMsgCount, session.gained);
      if (drip > 0) session.gained += drip;
      await saveChatSession(matchId, session);
      if (drip > 0) {
        await updateMatch(matchId, { affection: match.affection + drip });
      }
      setInput('');
      await reload();
    } finally {
      setSending(false);
    }
  }

  async function onBeatChoice(idx: number) {
    if (!beat || !match?.personas || !matchId) return;
    const delta = applyBeatChoice(beat, idx);
    const affection = Math.max(0, match.affection + delta);
    const beats_done = [...match.beats_done, beat.id];
    await updateMatch(matchId, { affection, beats_done });
    await grantBeatXp();
    await reload();
  }

  function openDatePicker() {
    if (!match || match.affection < 30) {
      Alert.alert('ยังไม่พร้อม', 'คุยกันให้ชอบกันก่อนนะ (30%)');
      return;
    }
    if (spotsError) {
      Alert.alert('โหลดจุดนัดไม่ได้', 'ลองใหม่อีกครั้ง');
      return;
    }
    setPickerOpen(true);
  }

  async function confirmDate(spot: GagAnchor) {
    if (!match?.personas || !matchId) return;
    setPickerOpen(false);
    const order = await placeDateOrder({
      matchId,
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
      <AffectionBar affection={match.affection} name={match.personas?.name} />
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => <ChatBubble text={item.text} role={item.role} />}
      />
      {beat ? (
        <View style={s.beat}>
          <Text style={s.beatLabel}>📖 จุดเปลี่ยนเรื่อง</Text>
          <Text style={s.beatScene}>{beat.scene}</Text>
          {beat.choices.map((c: { text: string }, i: number) => (
            <Pressable
              key={c.text}
              accessibilityRole="button"
              style={({ pressed }) => [s.beatBtn, pressed && s.beatBtnPressed]}
              onPress={() => onBeatChoice(i)}
            >
              <Text style={s.beatBtnText}>{c.text}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {match.affection >= 30 ? (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [s.dateBtn, pressed && s.dateBtnPressed]}
          onPress={openDatePicker}
        >
          <Text style={s.dateBtnText}>📍 นัดเดท</Text>
        </Pressable>
      ) : null}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="พิมพ์ข้อความ..."
          placeholderTextColor={theme.textMuted}
          editable={!sending}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ส่งข้อความ"
          style={({ pressed }) => [s.send, !canSend && s.sendDisabled, pressed && canSend && s.sendPressed]}
          onPress={send}
          disabled={!canSend}
        >
          <Text style={s.sendText}>{sending ? '…' : 'ส่ง'}</Text>
        </Pressable>
      </View>
      <SpotPicker
        visible={pickerOpen}
        anchors={spots}
        personaId={match.persona_id}
        loading={spotsLoading}
        onConfirm={confirmDate}
        onDismiss={() => setPickerOpen(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: theme.pad, gap: 8, paddingBottom: 8 },
  beat: {
    padding: theme.pad,
    gap: 8,
    backgroundColor: theme.dating.beatBg,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  beatLabel: { fontSize: 12, fontWeight: '800', color: theme.dating.rareText, textTransform: 'uppercase' },
  beatScene: { fontWeight: '700', fontSize: 15, lineHeight: 22 },
  beatBtn: {
    backgroundColor: theme.bg,
    borderRadius: theme.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  beatBtnPressed: { backgroundColor: theme.surface },
  beatBtnText: { fontSize: 15 },
  dateBtn: {
    marginHorizontal: theme.pad,
    marginTop: 8,
    backgroundColor: theme.green,
    borderRadius: theme.radius,
    padding: 14,
    alignItems: 'center',
  },
  dateBtnPressed: { backgroundColor: theme.greenDark },
  dateBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  inputRow: {
    flexDirection: 'row',
    padding: theme.pad,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: theme.bg,
  },
  input: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  send: {
    backgroundColor: theme.green,
    borderRadius: 22,
    paddingHorizontal: 18,
    justifyContent: 'center',
    minWidth: 56,
    alignItems: 'center',
  },
  sendPressed: { backgroundColor: theme.greenDark },
  sendDisabled: { opacity: 0.45 },
  sendText: { color: '#fff', fontWeight: '700' },
});
