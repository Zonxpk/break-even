import { useState } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from './theme';
import type { TrackingMapProps } from './TrackingMap.types';

/**
 * Web fallback map in the prototype's `.nb-map` notebook style: paper card,
 * a dashed hand-drawn route (real path data, normalized to the card), the
 * rider scooting along it, and a 🏠 flag at the destination.
 */
export default function TrackingMap({
  style,
  userPin,
  rider,
  path,
  trackingNoun,
  incidentKind,
}: TrackingMapProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const pts = path.map((k) => k.pos);
  const lats = [...pts.map((p) => p.lat), userPin.lat, rider.lat];
  const lngs = [...pts.map((p) => p.lng), userPin.lng, rider.lng];
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const PAD = 28;

  const toXY = (p: { lat: number; lng: number }) => ({
    x: PAD + ((p.lng - minLng) / (maxLng - minLng || 1)) * (size.w - PAD * 2),
    y: PAD + ((maxLat - p.lat) / (maxLat - minLat || 1)) * (size.h - PAD * 2),
  });

  const ready = size.w > 0 && size.h > 0 && pts.length > 1;
  const d = ready
    ? pts
        .map((p, i) => {
          const { x, y } = toXY(p);
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ')
    : '';
  const riderXY = ready ? toXY(rider) : { x: 0, y: 0 };
  const pinXY = ready ? toXY(userPin) : { x: 0, y: 0 };

  return (
    <View style={[style, s.map]} onLayout={onLayout}>
      {ready ? (
        <>
          <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill}>
            <Path
              d={d}
              fill="none"
              stroke={theme.doodle.blue}
              strokeWidth={3}
              strokeDasharray="2 9"
              strokeLinecap="round"
            />
          </Svg>
          <Text
            style={[s.emoji, { left: riderXY.x - 16, top: riderXY.y - 16, transform: [{ rotate: '10deg' }] }]}
            accessibilityLabel={trackingNoun}
          >
            {incidentKind === 'sleepy' ? '🛵💤' : '🛵'}
          </Text>
          <Text style={[s.emoji, s.flag, { left: pinXY.x - 14, top: pinXY.y - 14 }]}>🏠</Text>
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  map: { backgroundColor: theme.doodle.card, overflow: 'hidden' },
  emoji: { position: 'absolute', fontSize: 26 },
  flag: { fontSize: 24 },
});
