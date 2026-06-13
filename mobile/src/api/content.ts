import { supabase } from '../lib/supabase';
import type { CatalogItem, GagAnchor, GagScriptRow, Service, VoucherCampaign } from '../types/db';

export async function fetchCatalog(service: Service): Promise<CatalogItem[]> {
  const { data, error } = await supabase
    .from('catalog_items')
    .select('*')
    .eq('service', service)
    .eq('active', true)
    .order('sort');
  if (error) throw error;
  return data as CatalogItem[];
}

export async function fetchScripts(): Promise<GagScriptRow[]> {
  const { data, error } = await supabase.from('gag_scripts').select('*').eq('active', true);
  if (error) throw error;
  return data as GagScriptRow[];
}

export async function fetchAnchors(): Promise<GagAnchor[]> {
  const { data, error } = await supabase.from('gag_anchors').select('*');
  if (error) throw error;
  return data as GagAnchor[];
}

export async function fetchPromoCampaigns(): Promise<VoucherCampaign[]> {
  const { data, error } = await supabase
    .from('voucher_campaigns')
    .select('id, brand_id, title, image_url, terms, redeem_info, is_fallback')
    .eq('status', 'active')
    .eq('is_fallback', false)
    .limit(5);
  if (error) throw error;
  return data as VoucherCampaign[];
}
