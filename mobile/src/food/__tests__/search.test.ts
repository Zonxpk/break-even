import { filterRestaurants } from '../search';
import type { FoodRestaurant } from '../../types/db';

const restaurants: FoodRestaurant[] = [
  {
    id: '1',
    name: 'ครัวป้าแมว',
    cuisine_tags: ['อาหารตามสั่ง'],
    photo_url: null,
    banner_url: null,
    rating: 4.8,
    review_count: 200,
    delivery_fee: 0,
    eta_minutes: 25,
    promo_badge: null,
    tie_in_brand_id: null,
    active: true,
    sort: 1,
  },
  {
    id: '2',
    name: 'เจ๊ติ๋มท่าน้ำ',
    cuisine_tags: ['ก๋วยเตี๋ยว'],
    photo_url: null,
    banner_url: null,
    rating: 4.6,
    review_count: 150,
    delivery_fee: 15,
    eta_minutes: 30,
    promo_badge: null,
    tie_in_brand_id: null,
    active: true,
    sort: 2,
  },
];

test('filter by query on name', () => {
  expect(filterRestaurants(restaurants, 'ป้าแมว', []).map((r) => r.id)).toEqual(['1']);
});

test('filter by cuisine tag', () => {
  expect(filterRestaurants(restaurants, '', ['ก๋วยเตี๋ยว']).map((r) => r.id)).toEqual(['2']);
});
