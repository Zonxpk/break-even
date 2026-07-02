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
import { PaperBackground } from '../../ui/doodle/PaperBackground';
import { Sketch } from '../../ui/doodle/Sketch';
import { CrayonCta } from '../../ui/doodle/CrayonCta';
import { doodleHeader } from '../../ui/doodle/nav';
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
        <PaperBackground />
        <ActivityIndicator color={theme.doodle.coral} size="large" />
        <Text style={s.loadingText}>กำลังตามหาไรเดอร์...</Text>
      </View>
    );
  }

  const cfg = order.service === 'date'
    ? { trackingNoun: 'เดท', accent: theme.doodle.coral }
    : SERVICE_CONFIGS[order.service as Service] ?? SERVICE_CONFIGS.food;
  const rider = positionAt(path, state.progress);
  const lastChat = state.chat[state.chat.length - 1];

  return (
    <View style={s.root}>
      <PaperBackground />
      <Stack.Screen options={{ ...doodleHeader, title: `ติดตาม${cfg.trackingNoun}` }} />

      <View style={s.top}>
        <Text style={s.tag}>หายใจๆๆๆ</Text>
        <Text style={s.title}>ตาม{cfg.trackingNoun} (ที่หายไป)</Text>
        <Text style={s.eta}>
          ถึงใน <Text style={s.etaHighlight}>{Math.round(state.etaMinutes)} นาที</Text>
          {state.etaMinutes > 30 ? ' (โดยประมาณ... มากๆ)' : ''}
        </Text>
      </View>

      <View style={s.mapFrame}>
        <TrackingMap
          style={s.map}
          userPin={userPin}
          rider={rider}
          path={path}
          strokeColor={theme.doodle.blue}
          trackingNoun={cfg.trackingNoun}
          incidentKind={state.incident?.kind}
        />
      </View>

      <View style={s.panel}>
        {state.incident ? <Text style={s.incident}>⚠️ {incidentText(state.incident.kind)}</Text> : null}
        {lastChat ? (
          <Sketch style={s.chatBubble} fill={theme.doodle.card} seed={13} radius={16}>
            <View style={s.chatInner}>
              <Text style={s.chatWho}>ไรเดอร์</Text>
              <Text style={s.chatText}>{lastChat.text}</Text>
            </View>
          </Sketch>
        ) : null}
        {state.activeSabotage ? (
          <CrayonCta
            ghost
            label={`📞 ${state.activeSabotage.label}`}
            seed={61}
            onPress={() => setSabotageLog((l) => [...l, { action: state.activeSabotage!.action, atS: elapsedS }])}
          />
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
  root: { flex: 1, backgroundColor: theme.doodle.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.doodle.paper },
  loadingText: { fontFamily: theme.font, marginTop: 10, color: theme.doodle.inkSoft },

  top: { paddingHorizontal: theme.pad, paddingTop: theme.pad, paddingBottom: 4 },
  tag: {
    alignSelf: 'flex-start',
    fontFamily: theme.fontBold, fontSize: 13, color: '#fff',
    backgroundColor: theme.doodle.coral,
    borderWidth: 2.5, borderColor: theme.doodle.ink, borderRadius: 14,
    paddingHorizontal: 11, paddingVertical: 3, overflow: 'hidden',
    transform: [{ rotate: '1.5deg' }],
  },
  title: { fontFamily: theme.fontBold, fontSize: 22, color: theme.doodle.ink, marginTop: 10, lineHeight: 28 },
  eta: { fontFamily: theme.fontBold, fontSize: 17, color: theme.doodle.coral, marginTop: 6 },
  etaHighlight: { color: theme.doodle.coral, backgroundColor: theme.doodle.yellow },

  // the prototype's .nb-map: white notebook card, 3px ink border, radius 10
  mapFrame: {
    flex: 1,
    margin: theme.pad,
    marginTop: 12,
    borderWidth: 3,
    borderColor: theme.doodle.ink,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.doodle.card,
  },
  map: { flex: 1 },

  panel: { paddingHorizontal: theme.pad, paddingBottom: theme.pad, gap: 10 },
  incident: { fontFamily: theme.fontBold, color: '#6a531a', fontSize: 14 },
  chatBubble: { maxWidth: '88%', transform: [{ rotate: '-0.5deg' }] },
  chatInner: { paddingHorizontal: 12, paddingVertical: 10 },
  chatWho: { fontFamily: theme.fontBold, fontSize: 11, color: theme.doodle.inkSoft, marginBottom: 2 },
  chatText: { fontFamily: theme.fontBold, fontSize: 14, color: theme.doodle.ink, lineHeight: 19 },
  failText: {
    fontFamily: theme.fontBold, fontSize: 16, color: theme.doodle.coral,
    textAlign: 'center', paddingVertical: 6,
  },
});
