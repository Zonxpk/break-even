import { pickScript } from '../pickScript';
import type { GagScriptRow } from '../../types/db';

const mk = (id: string, service: GagScriptRow['service'], weight: number, active = true): GagScriptRow =>
  ({ id, service, weight, active, timeline: { duration_s: 10, events: [] }, season_tag: null });

test('only considers active scripts matching the service (null = any)', () => {
  const scripts = [mk('a', 'food', 1), mk('b', 'ride', 1), mk('c', null, 1), mk('d', 'food', 1, false)];
  for (let seed = 0; seed < 50; seed++) {
    const picked = pickScript(scripts, 'food', seed);
    expect(['a', 'c']).toContain(picked.id);
  }
});

test('same seed picks the same script', () => {
  const scripts = [mk('a', 'food', 1), mk('b', null, 3)];
  expect(pickScript(scripts, 'food', 123).id).toBe(pickScript(scripts, 'food', 123).id);
});

test('weight skews selection', () => {
  const scripts = [mk('a', null, 1), mk('b', null, 99)];
  let bCount = 0;
  for (let seed = 0; seed < 200; seed++) if (pickScript(scripts, 'food', seed).id === 'b') bCount++;
  expect(bCount).toBeGreaterThan(150);
});

test('throws when the pool is empty', () => {
  expect(() => pickScript([mk('a', 'ride', 1)], 'food', 1)).toThrow('NO_SCRIPT_AVAILABLE');
});
