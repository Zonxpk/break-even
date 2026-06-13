import { mulberry32 } from '../lib/rng';
import type { GagScriptRow, Service } from '../types/db';

export function pickScript(scripts: GagScriptRow[], service: Service | 'date', seed: number): GagScriptRow {
  const pool = scripts.filter((s) => s.active && (s.service == null || s.service === service));
  if (pool.length === 0) throw new Error('NO_SCRIPT_AVAILABLE');
  const total = pool.reduce((sum, s) => sum + Math.max(s.weight, 1), 0);
  let r = mulberry32(seed)() * total;
  for (const s of pool) {
    r -= Math.max(s.weight, 1);
    if (r <= 0) return s;
  }
  return pool[pool.length - 1];
}
