import { useMemo, useState } from 'react';
import {
  View, Text, Modal, Pressable, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { anchorDistanceKm } from '../dating/distanceJoke';
import { theme } from './theme';
import type { GagAnchor, AnchorType } from '../types/db';
import type { SpotPickerProps } from './SpotPicker.types';

const TYPE_META: Record<AnchorType, { emoji: string; label: string }> = {
  canal: { emoji: '🌊', label: 'คลอง' },
  seven_eleven: { emoji: '🏪', label: '7-11' },
  temple: { emoji: '🛕', label: 'วัด' },
  market: { emoji: '🛒', label: 'ตลาด' },
};

const TYPE_ORDER: AnchorType[] = ['canal', 'seven_eleven', 'temple', 'market'];

export default function SpotPicker({
  visible, anchors, personaId, loading, onConfirm, onDismiss,
}: SpotPickerProps) {
  const [selected, setSelected] = useState<GagAnchor | null>(null);
  const [showMap, setShowMap] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<AnchorType, GagAnchor[]>();
    for (const t of TYPE_ORDER) map.set(t, []);
    for (const a of anchors) {
      const list = map.get(a.type) ?? [];
      list.push(a);
      map.set(a.type, list);
    }
    return map;
  }, [anchors]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.title}>เลือกจุดนัดเดท</Text>
          <Pressable onPress={() => setShowMap((v) => !v)}>
            <Text style={s.mapToggle}>{showMap ? 'ซ่อนแผนที่' : 'ดูบนแผนที่ (เว็บ)'}</Text>
          </Pressable>

          {loading ? (
            <ActivityIndicator color={theme.green} style={{ marginVertical: 24 }} />
          ) : (
            <ScrollView style={s.list} contentContainerStyle={{ paddingBottom: 8 }}>
              {showMap ? (
                <View style={s.mapFallback}>
                  {anchors.map((a) => (
                    <Pressable key={a.id} onPress={() => setSelected(a)}>
                      <Text style={selected?.id === a.id ? s.mapOn : undefined}>
                        📍 {a.name} — {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {TYPE_ORDER.map((type) => {
                const items = grouped.get(type) ?? [];
                if (!items.length) return null;
                const meta = TYPE_META[type];
                return (
                  <View key={type} style={s.group}>
                    <Text style={s.groupHead}>{meta.emoji} {meta.label}</Text>
                    {items.map((a) => (
                      <Pressable
                        key={a.id}
                        style={[s.row, selected?.id === a.id && s.rowOn]}
                        onPress={() => setSelected(a)}
                      >
                        <Text style={s.rowName}>{a.name}</Text>
                        <Text style={s.rowSub}>{anchorDistanceKm(personaId, a.id)}</Text>
                      </Pressable>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={s.footer}>
            <Pressable style={s.cancel} onPress={onDismiss}>
              <Text>ยกเลิก</Text>
            </Pressable>
            <Pressable
              style={[s.confirm, !selected && s.confirmOff]}
              onPress={() => selected && onConfirm(selected)}
              disabled={!selected}
            >
              <Text style={s.confirmText}>
                {selected ? `ยืนยันนัดเดทที่ ${selected.name}` : 'เลือกจุดนัด'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', padding: theme.pad },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  mapToggle: { color: theme.greenDark, fontWeight: '700', marginBottom: 8 },
  list: { maxHeight: 360 },
  mapFallback: { backgroundColor: '#E8F4EC', borderRadius: theme.radius, padding: 12, gap: 8, marginBottom: 12 },
  mapOn: { fontWeight: '700', color: theme.greenDark },
  group: { marginBottom: 12 },
  groupHead: { fontWeight: '700', marginBottom: 6, color: theme.textMuted },
  row: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 12, marginBottom: 6, borderWidth: 2, borderColor: 'transparent' },
  rowOn: { borderColor: theme.greenDark },
  rowName: { fontWeight: '600' },
  rowSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  footer: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cancel: { padding: 14, borderRadius: theme.radius, backgroundColor: theme.surface },
  confirm: { flex: 1, padding: 14, borderRadius: theme.radius, backgroundColor: theme.green, alignItems: 'center' },
  confirmOff: { opacity: 0.5 },
  confirmText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
