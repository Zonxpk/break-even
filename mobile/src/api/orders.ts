import { supabase } from '../lib/supabase';
import { pickScript } from '../engine/pickScript';
import { fetchScripts } from './content';
import { XP, tierForXp } from '../balance/balance';
import type { OrderRow, Service, VoucherRow } from '../types/db';

export async function placeOrder(opts: { service: Service | 'date'; items: unknown[] }): Promise<OrderRow> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('NOT_SIGNED_IN');

  const scripts = await fetchScripts();
  const seed = Math.floor(Math.random() * 2 ** 31);
  const script = pickScript(scripts, opts.service, seed);

  const { data, error } = await supabase
    .from('orders')
    .insert({ user_id: userId, service: opts.service, items_json: opts.items, script_id: script.id, seed })
    .select()
    .single();
  if (error) throw error;
  return data as OrderRow;
}

export async function getOrder(orderId: string): Promise<OrderRow> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (error) throw error;
  return data as OrderRow;
}

export async function listOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as OrderRow[];
}

export function buildFailContext(opts: { service: string; finaleKind: string; priorFailCount: number }) {
  return { service: opts.service, finale_type: opts.finaleKind, nth_fail: opts.priorFailCount + 1 };
}

export interface FailResult {
  voucher: VoucherRow | null;
  rateLimited: boolean;
}

export async function failOrder(
  order: { id: string; service: string; status: string },
  finaleKind: string,
  opts?: { personaId?: string },
): Promise<FailResult> {
  if (order.status === 'failed_hilariously') return { voucher: null, rateLimited: false };

  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed_hilariously');

  await supabase.from('orders').update({ status: 'failed_hilariously' }).eq('id', order.id);

  const isDate = order.service === 'date';
  const xpGrant = isDate ? XP.date_ghosted : XP.order_failed;
  const trigger = isDate ? 'date_ghosted' : 'order_failed';

  const { data: prof } = await supabase.from('profiles').select('loyalty_xp').single();
  if (prof) {
    const xp = prof.loyalty_xp + xpGrant;
    await supabase.from('profiles').update({ loyalty_xp: xp, tier: tierForXp(xp) }).gte('loyalty_xp', 0);
  }

  const context = isDate
    ? { persona_id: opts?.personaId, finale_type: finaleKind, nth_fail: (count ?? 0) + 1 }
    : buildFailContext({ service: order.service, finaleKind, priorFailCount: count ?? 0 });
  const { data, error } = await supabase.rpc('grant_voucher', { p_trigger: trigger, p_context: context });
  if (error) {
    if (error.message.includes('RATE_LIMITED')) return { voucher: null, rateLimited: true };
    throw error;
  }
  return { voucher: data as VoucherRow, rateLimited: false };
}

export async function listVouchers(): Promise<(VoucherRow & { voucher_campaigns: { title: string; terms: string | null; redeem_info: string | null } })[]> {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*, voucher_campaigns(title, terms, redeem_info)')
    .order('granted_at', { ascending: false });
  if (error) throw error;
  return data as never;
}
