import { supabase } from '../lib/supabase';
import type { OrderRow, Service, VoucherRow } from '../types/db';

export async function placeOrder(opts: { service: Service | 'date'; items: unknown[] }): Promise<OrderRow> {
  const { data, error } = await supabase.rpc('create_order', {
    p_service: opts.service,
    p_items: opts.items,
  });
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
export async function failOrder(order: { id: string; status: string }): Promise<FailResult> {
  if (order.status === 'failed_hilariously') return { voucher: null, rateLimited: false };

  const { data, error } = await supabase.rpc('complete_order_failure', { p_order_id: order.id });
  if (error) {
    if (error.message.includes('RATE_LIMITED')) return { voucher: null, rateLimited: true };
    throw error;
  }
  const result = (data ?? {}) as { voucher?: VoucherRow | null; rate_limited?: boolean };
  return {
    voucher: result.voucher ?? null,
    rateLimited: result.rate_limited ?? false,
  };
}

export async function listVouchers(): Promise<(VoucherRow & { voucher_campaigns: { title: string; terms: string | null; redeem_info: string | null } })[]> {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*, voucher_campaigns(title, terms, redeem_info)')
    .order('granted_at', { ascending: false });
  if (error) throw error;
  return data as never;
}
