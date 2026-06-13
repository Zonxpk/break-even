import type { Keyframe, LatLng } from '../engine/path';

export type TrackingMapProps = {
  style: object;
  userPin: LatLng;
  rider: LatLng;
  path: Keyframe[];
  strokeColor: string;
  trackingNoun: string;
  incidentKind?: string;
};
