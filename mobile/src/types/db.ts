export type Service = 'food' | 'ride' | 'parcel' | 'mart';
export type Tier = 'silver' | 'gold' | 'platinum' | 'vip';

export interface Profile {
  id: string;
  nickname: string | null;
  loyalty_xp: number;
  tier: Tier;
}

export interface CatalogItem {
  id: string;
  service: Service;
  name: string;
  photo_url: string | null;
  price: number;
  rating: number | null;
  tie_in_brand_id: string | null;
  active: boolean;
  sort: number;
}

export interface FoodRestaurant {
  id: string;
  name: string;
  photo_url: string | null;
  banner_url: string | null;
  cuisine_tags: string[];
  rating: number | null;
  review_count: number;
  delivery_fee: number;
  eta_minutes: number;
  promo_badge: string | null;
  tie_in_brand_id: string | null;
  active: boolean;
  sort: number;
}

export interface FoodMenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  sort: number;
}

export interface FoodMenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  price: number;
  rating: number | null;
  active: boolean;
  sort: number;
}

export interface FoodModifierGroup {
  id: string;
  name: string;
  min_select: number;
  max_select: number;
  active: boolean;
  sort: number;
  options: FoodModifierOption[];
}

export interface FoodModifierOption {
  id: string;
  group_id: string;
  name: string;
  price_delta: number;
  active: boolean;
  sort: number;
}

export interface FoodPromo {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  restaurant_id: string | null;
  badge_text: string | null;
  active: boolean;
  sort: number;
  starts_at: string | null;
  ends_at: string | null;
}

export interface FoodMenuBundle {
  restaurant: FoodRestaurant;
  categories: FoodMenuCategory[];
  items: FoodMenuItem[];
  modifierGroupsByItemId: Record<string, FoodModifierGroup[]>;
}

export interface FoodOrderLinePayload {
  restaurant_id: string;
  restaurant_name: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  modifiers: Array<{ group: string; option: string }>;
  notes: string | null;
  line_total: number;
}

export interface GagScriptRow {
  id: string;
  service: Service | 'date' | null;
  timeline: import('../engine/types').GagScript;
  weight: number;
  active: boolean;
  season_tag: string | null;
}

export type AnchorType = 'canal' | 'seven_eleven' | 'temple' | 'market';

export interface GagAnchor {
  id: string;
  type: AnchorType;
  name: string;
  lat: number;
  lng: number;
}

export type OrderStatus = 'tracking' | 'failed_hilariously' | 'cancelled';

export interface OrderRow {
  id: string;
  user_id: string;
  service: Service | 'date';
  items_json: unknown[];
  script_id: string;
  seed: number;
  status: OrderStatus;
  created_at: string;
}

export interface VoucherRow {
  id: string;
  user_id: string;
  campaign_id: string;
  code: string | null;
  status: 'active' | 'spent' | 'redeemed' | 'expired';
  context: Record<string, unknown>;
  granted_at: string;
}

export interface VoucherCampaign {
  id: string;
  brand_id: string | null;
  title: string;
  image_url: string | null;
  terms: string | null;
  redeem_info: string | null;
  is_fallback: boolean;
}

export interface ShopSchedule {
  windows: Array<{
    from: string;
    to: string;
    days_of_week: number[];
    open: string;
    close: string;
  }>;
}

export interface ShopRow {
  id: string;
  brand_id: string;
  name: string;
  banner_url: string | null;
  schedule: ShopSchedule;
  status: 'active' | 'inactive';
}

export interface MerchItemRow {
  id: string;
  shop_id: string;
  name: string;
  images: string[];
  description: string | null;
  voucher_price: number;
  required_campaign_id: string | null;
  stock: number;
  redemption_instructions: string | null;
  active: boolean;
}

export type ClaimStatus = 'claimed' | 'redeemed' | 'expired';

export interface ClaimRow {
  id: string;
  user_id: string;
  merch_item_id: string;
  voucher_ids: string[];
  redemption_code: string;
  status: ClaimStatus;
  created_at: string;
}

export interface BrandMembership {
  brand_id: string;
  role: string;
}

export type PersonaRarity = 'common' | 'rare' | 'legendary';

export interface StoryBeat {
  id: string;
  at_affection: number;
  scene: string;
  choices: Array<{ text: string; affection: number }>;
}

export interface Persona {
  id: string;
  name: string;
  bio: string | null;
  rarity: PersonaRarity;
  system_prompt: string;
  beats: StoryBeat[];
  brand_id: string | null;
  active: boolean;
}

export interface MatchRow {
  id: string;
  user_id: string;
  persona_id: string;
  affection: number;
  beats_done: string[];
  created_at: string;
}
