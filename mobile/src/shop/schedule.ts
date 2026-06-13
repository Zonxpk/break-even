const BANGKOK = 'Asia/Bangkok';

export interface ShopWindow {
  from: string;
  to: string;
  days_of_week: number[];
  open: string;
  close: string;
}

export interface ShopSchedule {
  windows: ShopWindow[];
}

interface BangkokParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
  dateStr: string;
}

function bangkokParts(now: Date): BangkokParts {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: BANGKOK,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });
  const parts = fmt.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));
  return {
    year,
    month,
    day,
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    weekday: weekdayMap[get('weekday')] ?? 0,
    dateStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

function parseHm(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(':').map(Number);
  return { h, m };
}

function inDateRange(dateStr: string, from: string, to: string): boolean {
  return dateStr >= from && dateStr <= to;
}

function minutesSinceMidnight(h: number, m: number): number {
  return h * 60 + m;
}

function windowOpenAt(parts: BangkokParts, w: ShopWindow): boolean {
  if (!inDateRange(parts.dateStr, w.from, w.to)) return false;
  if (!w.days_of_week.includes(parts.weekday)) return false;
  const open = parseHm(w.open);
  const close = parseHm(w.close);
  const nowMin = minutesSinceMidnight(parts.hour, parts.minute);
  const openMin = minutesSinceMidnight(open.h, open.m);
  const closeMin = minutesSinceMidnight(close.h, close.m);
  return nowMin >= openMin && nowMin < closeMin;
}

export function isShopOpen(schedule: ShopSchedule, now = new Date()): boolean {
  if (!schedule.windows.length) return false;
  const parts = bangkokParts(now);
  return schedule.windows.some((w) => windowOpenAt(parts, w));
}

function nextOpenInstant(schedule: ShopSchedule, now: Date): Date | null {
  for (let offsetMin = 0; offsetMin < 60 * 24 * 14; offsetMin++) {
    const candidate = new Date(now.getTime() + offsetMin * 60_000);
    const parts = bangkokParts(candidate);
    for (const w of schedule.windows) {
      if (!inDateRange(parts.dateStr, w.from, w.to)) continue;
      if (!w.days_of_week.includes(parts.weekday)) continue;
      const open = parseHm(w.open);
      const openMin = minutesSinceMidnight(open.h, open.m);
      const candMin = minutesSinceMidnight(parts.hour, parts.minute);
      if (candMin === openMin && offsetMin > 0) return candidate;
      if (offsetMin === 0 && candMin < openMin) {
        const delta = (openMin - candMin) * 60_000;
        return new Date(now.getTime() + delta);
      }
    }
  }
  return null;
}

export function msUntilNextOpen(schedule: ShopSchedule, now = new Date()): number {
  if (isShopOpen(schedule, now)) return 0;
  const next = nextOpenInstant(schedule, now);
  if (!next) return 0;
  return Math.max(0, next.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalMin = Math.ceil(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `เปิดใน ${h} ชม. ${m} นาที`;
  return `เปิดใน ${m} นาที`;
}
