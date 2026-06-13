import { resolveSwipe } from '../swipe';

describe('resolveSwipe', () => {
  test('legendary rarely matches at silver', () => {
    let matches = 0;
    for (let i = 0; i < 100; i++) {
      if (resolveSwipe({ tier: 'silver', rarity: 'legendary', seed: i }) === 'match') matches++;
    }
    expect(matches).toBeLessThan(20);
  });

  test('common usually matches at vip', () => {
    let matches = 0;
    for (let i = 0; i < 20; i++) {
      if (resolveSwipe({ tier: 'vip', rarity: 'common', seed: i + 1000 }) === 'match') matches++;
    }
    expect(matches).toBeGreaterThan(10);
  });
});
