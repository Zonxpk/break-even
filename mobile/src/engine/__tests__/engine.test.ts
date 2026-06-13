import { engineStateAt } from '../engine';
import type { GagScript } from '../types';

const SCRIPT: GagScript = {
  duration_s: 240,
  events: [
    { t: 0, type: 'eta', minutes: 14 },
    { t: 0, type: 'move', mode: 'route_to_user' },
    { t: 40, type: 'move', mode: 'wrong_turn' },
    { t: 45, type: 'chat', text: 'พี่ขับผ่านซอยไปนิดนึงครับ' },
    { t: 90, type: 'incident', kind: 'sleepy', anchor: 'seven_eleven', eta_minutes: 45 },
    {
      t: 90, type: 'sabotage', action: 'call', label: 'โทรปลุกไรเดอร์',
      backfire: { chat: 'ใกล้ถึงแล้วครับพี่', move: 'wrong_direction', eta_minutes: 87 },
    },
    { t: 210, type: 'finale', kind: 'canal', anchor: 'canal', status_text: 'ไรเดอร์ตกคลอง' },
  ],
};

test('state is a pure function of elapsed time', () => {
  const a = engineStateAt({ script: SCRIPT, elapsedS: 100, sabotageLog: [] });
  const b = engineStateAt({ script: SCRIPT, elapsedS: 100, sabotageLog: [] });
  expect(a).toEqual(b);
});

test('start: normal-looking tracking', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 5, sabotageLog: [] });
  expect(s.phase).toBe('tracking');
  expect(s.etaMinutes).toBe(14);
  expect(s.currentMove).toBe('route_to_user');
  expect(s.chat).toHaveLength(0);
  expect(s.activeSabotage).toBeNull();
});

test('mid-run: incident applied, ETA grown, sabotage offered', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 100, sabotageLog: [] });
  expect(s.incident?.kind).toBe('sleepy');
  expect(s.etaMinutes).toBe(45);
  expect(s.currentMove).toBe('wrong_turn');
  expect(s.chat.map((c) => c.text)).toEqual(['พี่ขับผ่านซอยไปนิดนึงครับ']);
  expect(s.activeSabotage).toEqual({ action: 'call', label: 'โทรปลุกไรเดอร์' });
});

test('sabotage backfires: chat appended chronologically, ETA worsens, move overridden', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 120, sabotageLog: [{ action: 'call', atS: 110 }] });
  expect(s.chat.map((c) => c.text)).toEqual(['พี่ขับผ่านซอยไปนิดนึงครับ', 'ใกล้ถึงแล้วครับพี่']);
  expect(s.etaMinutes).toBe(87);
  expect(s.currentMove).toBe('wrong_direction');
  expect(s.activeSabotage).toBeNull();
});

test('sabotage not yet taken at queried time has no effect', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 100, sabotageLog: [{ action: 'call', atS: 110 }] });
  expect(s.etaMinutes).toBe(45);
  expect(s.activeSabotage).not.toBeNull();
});

test('finale fires and ends the run', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 239, sabotageLog: [] });
  expect(s.phase).toBe('failed');
  expect(s.finale).toEqual({ kind: 'canal', anchor: 'canal', statusText: 'ไรเดอร์ตกคลอง' });
  expect(s.activeSabotage).toBeNull();
});

test('every event eventually reaches a finale at duration end', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: SCRIPT.duration_s + 1, sabotageLog: [] });
  expect(s.phase).toBe('failed');
  expect(s.progress).toBe(1);
});
