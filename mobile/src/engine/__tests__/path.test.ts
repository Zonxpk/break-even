import { buildDoomedPath, positionAt, nearestAnchor } from '../path';
import type { GagScript } from '../types';
import type { GagAnchor } from '../../types/db';

const ANCHORS: GagAnchor[] = [
  { id: '1', type: 'canal', name: 'คลอง', lat: 13.75, lng: 100.54 },
  { id: '2', type: 'seven_eleven', name: '7-11', lat: 13.76, lng: 100.50 },
];

const BASE = [
  { lat: 13.70, lng: 100.50 },
  { lat: 13.72, lng: 100.51 },
  { lat: 13.74, lng: 100.52 },
];

const SCRIPT: GagScript = {
  duration_s: 100,
  events: [
    { t: 0, type: 'move', mode: 'route_to_user' },
    { t: 50, type: 'incident', kind: 'sleepy', anchor: 'seven_eleven' },
    { t: 90, type: 'finale', kind: 'canal', anchor: 'canal', status_text: 'x' },
  ],
};

test('nearestAnchor picks the closest of the requested type', () => {
  const a = nearestAnchor(ANCHORS, 'canal', { lat: 13.74, lng: 100.52 });
  expect(a?.id).toBe('1');
  expect(nearestAnchor(ANCHORS, 'temple', { lat: 0, lng: 0 })).toBeNull();
});

test('path starts at route start and ends at the finale anchor', () => {
  const path = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  expect(path[0].pos).toEqual(BASE[0]);
  const last = path[path.length - 1];
  expect(last.f).toBe(1);
  expect(last.pos).toEqual({ lat: 13.75, lng: 100.54 });
});

test('incident parks the rider at its anchor', () => {
  const path = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  const atIncident = positionAt(path, 0.5);
  expect(atIncident.lat).toBeCloseTo(13.76, 5);
  expect(atIncident.lng).toBeCloseTo(100.5, 5);
});

test('positionAt interpolates between keyframes and clamps', () => {
  const path = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  expect(positionAt(path, -1)).toEqual(path[0].pos);
  expect(positionAt(path, 2)).toEqual(path[path.length - 1].pos);
  const mid = positionAt(path, 0.25);
  expect(Number.isFinite(mid.lat)).toBe(true);
  expect(Number.isFinite(mid.lng)).toBe(true);
});

test('same seed → same path; different seed may differ', () => {
  const p1 = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  const p2 = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  expect(p1).toEqual(p2);
});
