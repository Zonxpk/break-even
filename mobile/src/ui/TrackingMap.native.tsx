import MapView, { Marker, Polyline } from 'react-native-maps';
import { Text } from 'react-native';
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
  return (
    <MapView
      style={style}
      initialRegion={{
        latitude: userPin.lat,
        longitude: userPin.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Polyline
        coordinates={path.map((k) => ({ latitude: k.pos.lat, longitude: k.pos.lng }))}
        strokeColor={strokeColor}
        strokeWidth={3}
        lineDashPattern={[8, 6]}
      />
      <Marker coordinate={{ latitude: userPin.lat, longitude: userPin.lng }} title="คุณ">
        <Text style={{ fontSize: 26 }}>📍</Text>
      </Marker>
      <Marker coordinate={{ latitude: rider.lat, longitude: rider.lng }} title={trackingNoun}>
        <Text style={{ fontSize: 28 }}>{incidentKind === 'sleepy' ? '🛵💤' : '🛵'}</Text>
      </Marker>
    </MapView>
  );
}
