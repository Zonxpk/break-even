import { View, Text, StyleSheet } from 'react-native';
import type { TrackingMapProps } from './TrackingMap.types';

export default function TrackingMap({
  style,
  userPin,
  rider,
  path,
  strokeColor,
  trackingNoun,
  incidentKind,
}: TrackingMapProps) {
  const mid = path[Math.floor(path.length / 2)]?.pos ?? rider;

  return (
    <View style={[style, styles.map, { borderColor: strokeColor }]}>
      <Text style={styles.title}>ติดตาม{trackingNoun} (เว็บ)</Text>
      <View style={styles.route}>
        <Text style={styles.pin}>📍 คุณ — {userPin.lat.toFixed(4)}, {userPin.lng.toFixed(4)}</Text>
        <Text style={[styles.rider, { color: strokeColor }]}>
          {incidentKind === 'sleepy' ? '🛵💤' : '🛵'} {trackingNoun} — {rider.lat.toFixed(4)}, {rider.lng.toFixed(4)}
        </Text>
        <Text style={styles.mid}>เส้นทาง {path.length} จุด · กลาง {mid.lat.toFixed(4)}, {mid.lng.toFixed(4)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    backgroundColor: '#E8F4EC',
    borderWidth: 2,
    justifyContent: 'center',
    padding: 20,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  route: { gap: 8 },
  pin: { fontSize: 14 },
  rider: { fontSize: 14, fontWeight: '600' },
  mid: { fontSize: 12, color: '#666', marginTop: 8 },
});
