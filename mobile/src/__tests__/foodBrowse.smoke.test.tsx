import React from 'react';
import { render } from '@testing-library/react-native';
import FoodRestaurantList from '../app/order/food/index';

jest.mock('../api/food', () => ({
  fetchFoodRestaurants: jest.fn().mockResolvedValue([
    {
      id: 'r1',
      name: 'ครัวป้าแมว',
      cuisine_tags: ['อาหารตามสั่ง'],
      photo_url: null,
      banner_url: null,
      rating: 4.8,
      review_count: 100,
      delivery_fee: 0,
      eta_minutes: 25,
      promo_badge: null,
      tie_in_brand_id: null,
      active: true,
      sort: 1,
    },
  ]),
  fetchFoodPromos: jest.fn().mockResolvedValue([]),
}));

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn() }),
}));

test('food restaurant list renders seeded restaurant', async () => {
  const { getByText } = await render(<FoodRestaurantList />);
  expect(getByText('ครัวป้าแมว')).toBeTruthy();
});
