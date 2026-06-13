import { buildFailContext } from '../orders';

test('fail context carries service, finale kind, and nth_fail', () => {
  const ctx = buildFailContext({
    service: 'food',
    finaleKind: 'canal',
    priorFailCount: 4,
  });
  expect(ctx).toEqual({ service: 'food', finale_type: 'canal', nth_fail: 5 });
});

test('nth_fail counts THIS failure (prior + 1)', () => {
  expect(buildFailContext({ service: 'mart', finaleKind: 'lost', priorFailCount: 0 }).nth_fail).toBe(1);
});
