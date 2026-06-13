import { TIERS, XP, MATCH_CAP, tierForXp, matchChance } from '../balance';

test('tier thresholds are strictly monotonic from 0', () => {
  expect(TIERS[0].minXp).toBe(0);
  for (let i = 1; i < TIERS.length; i++) {
    expect(TIERS[i].minXp).toBeGreaterThan(TIERS[i - 1].minXp);
  }
});

test('tierForXp picks the highest threshold reached', () => {
  expect(tierForXp(0)).toBe('silver');
  expect(tierForXp(TIERS[1].minXp)).toBe('gold');
  expect(tierForXp(TIERS[3].minXp + 9999)).toBe('vip');
  expect(tierForXp(TIERS[1].minXp - 1)).toBe('silver');
});

test('all XP grants are positive', () => {
  Object.values(XP).forEach((v) => expect(v).toBeGreaterThan(0));
});

test('match chance stays within (0, cap] for every tier × rarity', () => {
  (['silver', 'gold', 'platinum', 'vip'] as const).forEach((tier) => {
    (['common', 'rare', 'legendary'] as const).forEach((rarity) => {
      const c = matchChance(tier, rarity);
      expect(c).toBeGreaterThan(0);
      expect(c).toBeLessThanOrEqual(MATCH_CAP[rarity]);
    });
  });
});

test('higher tier never lowers match chance', () => {
  const order = ['silver', 'gold', 'platinum', 'vip'] as const;
  (['common', 'rare', 'legendary'] as const).forEach((rarity) => {
    for (let i = 1; i < order.length; i++) {
      expect(matchChance(order[i], rarity)).toBeGreaterThanOrEqual(matchChance(order[i - 1], rarity));
    }
  });
});

test('legendary stays special even for VIP', () => {
  expect(matchChance('vip', 'legendary')).toBeLessThanOrEqual(0.3);
});
