import { formatCountdown, isShopOpen, msUntilNextOpen, type ShopSchedule } from '../schedule';

const SCHEDULE: ShopSchedule = {
  windows: [{ from: '2026-06-01', to: '2026-06-30', days_of_week: [5], open: '18:00', close: '22:00' }],
};

describe('shop schedule', () => {
  test('open on scheduled Friday evening', () => {
    const now = new Date('2026-06-12T19:00:00+07:00'); // Friday
    expect(isShopOpen(SCHEDULE, now)).toBe(true);
  });

  test('closed outside window hours', () => {
    const now = new Date('2026-06-12T12:00:00+07:00'); // Friday noon
    expect(isShopOpen(SCHEDULE, now)).toBe(false);
  });

  test('closed on wrong day', () => {
    const now = new Date('2026-06-13T19:00:00+07:00'); // Saturday
    expect(isShopOpen(SCHEDULE, now)).toBe(false);
  });

  test('countdown positive when closed', () => {
    const now = new Date('2026-06-12T12:00:00+07:00');
    expect(msUntilNextOpen(SCHEDULE, now)).toBeGreaterThan(0);
  });

  test('formatCountdown shows hours and minutes', () => {
    expect(formatCountdown(90 * 60 * 1000)).toMatch(/1.*ชม/);
  });
});
