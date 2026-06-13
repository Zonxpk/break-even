import { act } from '@testing-library/react-native';

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInAnonymously: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'u1', nickname: 'ทดสอบ', loyalty_xp: 30, tier: 'silver' },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

import { useAuth } from '../state/auth';

beforeEach(() => {
  useAuth.setState({ userId: null, profile: null, loading: true });
});

test('init signs in as guest when no session exists', async () => {
  await act(async () => {
    await useAuth.getState().init();
  });
  expect(useAuth.getState().userId).toBe('u1');
  expect(useAuth.getState().loading).toBe(false);
});

test('guest sign-in loads the profile', async () => {
  await act(async () => {
    await useAuth.getState().signInGuest('ทดสอบ');
  });
  expect(useAuth.getState().profile?.nickname).toBe('ทดสอบ');
  expect(useAuth.getState().userId).toBe('u1');
});

test('signOut starts a fresh guest session', async () => {
  await act(async () => {
    await useAuth.getState().signInGuest('ทดสอบ');
    await useAuth.getState().signOut();
  });
  expect(useAuth.getState().userId).toBe('u1');
  expect(useAuth.getState().profile).not.toBeNull();
});
