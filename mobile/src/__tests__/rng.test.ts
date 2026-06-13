import { mulberry32 } from '../lib/rng';

test('same seed yields same sequence', () => {
  const a = mulberry32(42), b = mulberry32(42);
  const seqA = [a(), a(), a()], seqB = [b(), b(), b()];
  expect(seqA).toEqual(seqB);
});

test('different seeds diverge', () => {
  expect(mulberry32(1)()).not.toEqual(mulberry32(2)());
});

test('outputs in [0,1)', () => {
  const r = mulberry32(7);
  for (let i = 0; i < 1000; i++) {
    const v = r();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  }
});
