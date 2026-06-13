import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import TrackingMap from '../../ui/TrackingMap';
import { engineStateAt } from '../../engine/engine';
import { buildDoomedPath, positionAt, type Keyframe, type LatLng } from '../../engine/path';
import { fetchRoute } from '../../engine/route';
import { fetchAnchors } from '../../api/content';
import { getOrder } from '../../api/orders';
import { supabase } from '../../lib/supabase';
import { SERVICE_CONFIGS } from '../../services/config';
import { theme } from '../../ui/theme';
import type { GagScriptRow, OrderRow, Service } from '../../types/db';
import type { SabotageAction } from '../../engine/types';

function fakeEndpoints(seed: number): { from: LatLng; to: LatLng } {
  const j = (n: number) => ((seed >> n) % 100) / 100 - 0.5;
  return {
    from: { lat: 13.7463 + j(3) * 0.02, lng: 100.5348 + j(5) * 0.02 },
    to: { lat: 13.7463 + 0.018 + j(7) * 0.01, lng: 100.5348 + 0.015 + j(11) * 0.01 },
  };
}

export default function Track() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [script, setScript] = useState<GagScriptRow | null>(null);
  const [path, setPath] = useState<Keyframe[] | null>(null);
  const [userPin, setUserPin] = useState<LatLng | null>(null);
  const [sabotageLog, setSabotageLog] = useState<SabotageAction[]>([]);
  const [nowMs, setNowMs] = useState(Date.now());
  const navigated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const o = await getOrder(orderId!);
      const { data: sc } = await supabase.from('gag_scripts').select('*').eq('id', o.script_id).single();
      const anchors = await fetchAnchors();
      const { from, to } = fakeEndpoints(o.seed);
      const base = await fetchRoute(from, to, o.seed);
      if (cancelled) return;
      setOrder(o);
      setScript(sc as GagScriptRow);
      setUserPin(to);
      setPath(buildDoomedPath({ base, script: (sc as GagScriptRow).timeline, anchors, seed: o.seed }));
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsedS = order ? (nowMs - new Date(order.created_at).getTime()) / 1000 : 0;

  const state = useMemo(
    () => (script ? engineStateAt({ script: script.timeline, elapsedS, sabotageLog }) : null),
    [script, elapsedS, sabotageLog],
  );

  useEffect(() => {
    if (state?.phase === 'failed' && !navigated.current) {
      navigated.current = true;
      const kind = state.finale?.kind ?? 'lost';
      setTimeout(() => router.replace(`/fail/${orderId}?kind=${encodeURIComponent(kind)}` as '/fail/[orderId]'), 1600);
    }
  }, [state?.phase]);

  if (!order || !script || !path || !state || !userPin) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={theme.green} size="large" />
        <Text style={{ marginTop: 10, color: theme.textMuted }}>กำลังตามหาไรเดอร์...</Text>
      </View>
    );
  }

  const cfg = order.service === 'date'
    ? { trackingNoun: 'เดท', accent: '#E91E63' }
    : SERVICE_CONFIGS[order.service as Service] ?? SERVICE_CONFIGS.food;
  const rider = positionAt(path, state.progress);
  const lastChat = state.chat[state.chat.length - 1];

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: `ติดตาม${cfg.trackingNoun}` }} />
      <TrackingMap
        style={s.map}
        userPin={userPin}
        rider={rider}
        path={path}
        strokeColor={cfg.accent}
        trackingNoun={cfg.trackingNoun}
        incidentKind={state.incident?.kind}
      />

      <View style={s.panel}>
        <Text style={s.eta}>ถึงใน {Math.round(state.etaMinutes)} นาที{state.etaMinutes > 30 ? ' (โดยประมาณ... มากๆ)' : ''}</Text>
        {state.incident ? <Text style={s.incident}>⚠️ {incidentText(state.incident.kind)}</Text> : null}
        {lastChat ? (
          <View style={s.chatBubble}>
            <Text style={s.chatText}>💬 {lastChat.text}</Text>
          </View>
        ) : null}
        {state.activeSabotage ? (
          <Pressable
            style={[s.sabotage, { borderColor: cfg.accent }]}
            onPress={() => setSabotageLog((l) => [...l, { action: state.activeSabotage!.action, atS: elapsedS }])}
          >
            <Text style={[s.sabotageText, { color: cfg.accent }]}>📞 {state.activeSabotage.label}</Text>
          </Pressable>
        ) : null}
        {state.phase === 'failed' ? <Text style={s.failText}>{state.finale?.statusText}</Text> : null}
      </View>
    </View>
  );
}

function incidentText(kind: string): string {
  switch (kind) {
    case 'sleepy': return 'ไรเดอร์แวะพัก (นานผิดปกติ)';
    case 'lost': return 'ไรเดอร์ดูจะหลงทาง';
    default: return 'เกิดเหตุการณ์ไม่คาดฝัน';
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  map: { flex: 1 },
  panel: { padding: theme.pad, gap: 10, backgroundColor: theme.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20 },
  eta: { fontSize: 18, fontWeight: '800' },
  incident: { color: '#B8860B', fontWeight: '600' },
  chatBubble: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 12 },
  chatText: { fontSize: 14 },
  sabotage: { borderWidth: 2, borderRadius: theme.radius, padding: 14, alignItems: 'center' },
  sabotageText: { fontWeight: '700' },
  failText: { fontSize: 16, fontWeight: '800', color: theme.danger, textAlign: 'center', paddingVertical: 6 },
});
