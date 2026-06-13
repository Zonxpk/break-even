import { supabase } from '../lib/supabase';
import type { ClaimRow, MerchItemRow, ShopRow } from '../types/db';

export class ShopError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

export async function fetchActiveShops(): Promise<ShopRow[]> {
  const { data, error } = await supabase.from('shops').select('*').eq('status', 'active');
  if (error) throw error;
  return data as ShopRow[];
}

export async function fetchMerchForShop(shopId: string): Promise<MerchItemRow[]> {
  const { data, error } = await supabase
    .from('merch_items')
    .select('*')
    .eq('shop_id', shopId)
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return (data as MerchItemRow[]).map((row) => ({
    ...row,
    images: Array.isArray(row.images) ? row.images : [],
  }));
}

export async function claimMerchItem(itemId: string): Promise<ClaimRow> {
  const { data, error } = await supabase.rpc('claim_merch', { p_item_id: itemId });
  if (error) {
    const msg = error.message;
    if (msg.includes('INSUFFICIENT_VOUCHERS')) throw new ShopError('INSUFFICIENT_VOUCHERS');
    if (msg.includes('OUT_OF_STOCK')) throw new ShopError('OUT_OF_STOCK');
    if (msg.includes('ITEM_NOT_FOUND')) throw new ShopError('ITEM_NOT_FOUND');
    throw error;
  }
  return data as ClaimRow;
}

export async function listMyClaims(): Promise<(ClaimRow & { merch_items: MerchItemRow | null })[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('*, merch_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getClaim(claimId: string): Promise<ClaimRow & { merch_items: MerchItemRow | null }> {
  const { data, error } = await supabase.from('claims').select('*, merch_items(*)').eq('id', claimId).single();
  if (error) throw error;
  return data as never;
}

export async function fetchBrandMemberships(): Promise<{ brand_id: string; role: string }[]> {
  const { data, error } = await supabase.from('brand_members').select('brand_id, role');
  if (error) throw error;
  return data ?? [];
}

export async function redeemClaimCode(code: string): Promise<ClaimRow> {
  const { data, error } = await supabase.rpc('redeem_claim', { p_code: code.trim() });
  if (error) {
    if (error.message.includes('NOT_BRAND_MEMBER')) throw new ShopError('NOT_BRAND_MEMBER');
    if (error.message.includes('CLAIM_NOT_FOUND')) throw new ShopError('CLAIM_NOT_FOUND');
    if (error.message.includes('ALREADY_REDEEMED')) throw new ShopError('ALREADY_REDEEMED');
    throw error;
  }
  return data as ClaimRow;
}
