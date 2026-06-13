import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../api/content', () => ({ fetchPromoCampaigns: jest.fn().mockResolvedValue([]) }));
jest.mock('../state/auth', () => ({
  useAuth: () => ({ profile: { nickname: 'ทดสอบ', loyalty_xp: 0, tier: 'silver', id: 'u1' } }),
}));

import Home from '../app/(tabs)/index';

test('home renders greeting and all four service tiles', async () => {
  const { getByTestId } = await render(<Home />);
  expect(getByTestId('greeting')).toBeTruthy();
  ['food', 'ride', 'parcel', 'mart'].forEach((k) => expect(getByTestId(`svc-${k}`)).toBeTruthy());
});
