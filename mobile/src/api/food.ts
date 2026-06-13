import { supabase } from '../lib/supabase';
import type {
  FoodMenuBundle,
  FoodMenuCategory,
  FoodMenuItem,
  FoodModifierGroup,
  FoodModifierOption,
  FoodPromo,
  FoodRestaurant,
} from '../types/db';

export async function fetchFoodRestaurants(query?: string): Promise<FoodRestaurant[]> {
  let q = supabase.from('food_restaurants').select('*').eq('active', true).order('sort');
  if (query?.trim()) {
    const term = `%${query.trim()}%`;
    q = q.or(`name.ilike.${term}`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data as FoodRestaurant[];
}

export async function fetchFoodPromos(): Promise<FoodPromo[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('food_promos')
    .select('*')
    .eq('active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('sort');
  if (error) throw error;
  return (data as FoodPromo[]).filter((p) => {
    const startOk = !p.starts_at || p.starts_at <= now;
    const endOk = !p.ends_at || p.ends_at >= now;
    return startOk && endOk;
  });
}

export async function fetchRestaurantMenu(restaurantId: string): Promise<FoodMenuBundle> {
  const { data: restaurant, error: rErr } = await supabase
    .from('food_restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();
  if (rErr) throw rErr;

  const { data: categories, error: cErr } = await supabase
    .from('food_menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort');
  if (cErr) throw cErr;

  const { data: items, error: iErr } = await supabase
    .from('food_menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('active', true)
    .order('sort');
  if (iErr) throw iErr;

  const menuItems = items as FoodMenuItem[];
  const itemIds = menuItems.map((i) => i.id);
  const modifierGroupsByItemId: Record<string, FoodModifierGroup[]> = {};
  for (const id of itemIds) modifierGroupsByItemId[id] = [];

  if (itemIds.length > 0) {
    const { data: links, error: lErr } = await supabase
      .from('food_item_modifier_groups')
      .select('menu_item_id, group_id, sort')
      .in('menu_item_id', itemIds)
      .order('sort');
    if (lErr) throw lErr;

    const groupIds = [...new Set((links ?? []).map((l) => l.group_id as string))];
    if (groupIds.length > 0) {
      const { data: groups, error: gErr } = await supabase
        .from('food_modifier_groups')
        .select('*')
        .in('id', groupIds)
        .eq('active', true)
        .order('sort');
      if (gErr) throw gErr;

      const { data: options, error: oErr } = await supabase
        .from('food_modifier_options')
        .select('*')
        .in('group_id', groupIds)
        .eq('active', true)
        .order('sort');
      if (oErr) throw oErr;

      const optionsByGroup = new Map<string, FoodModifierOption[]>();
      for (const o of options as FoodModifierOption[]) {
        const arr = optionsByGroup.get(o.group_id) ?? [];
        arr.push(o);
        optionsByGroup.set(o.group_id, arr);
      }

      const groupMap = new Map<string, FoodModifierGroup>();
      for (const g of groups as FoodModifierGroup[]) {
        groupMap.set(g.id, { ...g, options: optionsByGroup.get(g.id) ?? [] });
      }

      for (const link of links ?? []) {
        const g = groupMap.get(link.group_id as string);
        if (g) modifierGroupsByItemId[link.menu_item_id as string].push(g);
      }
    }
  }

  return {
    restaurant: restaurant as FoodRestaurant,
    categories: categories as FoodMenuCategory[],
    items: menuItems,
    modifierGroupsByItemId,
  };
}
