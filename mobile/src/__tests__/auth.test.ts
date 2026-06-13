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

test('guest sign-in loads the profile', async () => {
  await act(async () => {
    await useAuth.getState().signInGuest('ทดสอบ');
  });
  expect(useAuth.getState().profile?.nickname).toBe('ทดสอบ');
  expect(useAuth.getState().userId).toBe('u1');
});

test('signOut clears state', async () => {
  await act(async () => {
    await useAuth.getState().signOut();
  });
  expect(useAuth.getState().userId).toBeNull();
  expect(useAuth.getState().profile).toBeNull();
});
