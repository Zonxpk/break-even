import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/db';

export const DEFAULT_GUEST_NICKNAME = 'ลูกค้านิรนาม';

interface AuthState {
  userId: string | null;
  profile: Profile | null;
  loading: boolean;
  init: () => Promise<void>;
  signInGuest: (nickname: string) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, nickname: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return (data as Profile) ?? null;
}

async function signInAsGuest(nickname: string) {
  const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { nickname } } });
  if (error) throw error;
  const userId = data.user!.id;
  return { userId, profile: await loadProfile(userId) };
}

export const useAuth = create<AuthState>((set, get) => ({
  userId: null,
  profile: null,
  loading: true,

  init: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      let userId = data.session?.user.id ?? null;
      let profile = userId ? await loadProfile(userId) : null;
      if (!userId) {
        const guest = await signInAsGuest(DEFAULT_GUEST_NICKNAME);
        userId = guest.userId;
        profile = guest.profile;
      }
      set({ userId, profile, loading: false });
      supabase.auth.onAuthStateChange((_event, session) => {
        const id = session?.user.id ?? null;
        set({ userId: id });
        if (id) loadProfile(id).then((p) => set({ profile: p }));
        else set({ profile: null });
      });
    } catch (e) {
      // Supabase unreachable (offline / cold backend): boot into a data-less
      // guest state instead of crashing the app with an uncaught rejection.
      console.warn('[auth] init failed, continuing offline:', e);
      set({ userId: null, profile: null, loading: false });
    }
  },

  signInGuest: async (nickname) => {
    const { userId, profile } = await signInAsGuest(nickname);
    set({ userId, profile, loading: false });
  },

  signInEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const userId = data.user!.id;
    set({ userId, profile: await loadProfile(userId), loading: false });
  },

  signUpEmail: async (email, password, nickname) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nickname } } });
    if (error) throw error;
    const userId = data.user!.id;
    set({ userId, profile: await loadProfile(userId), loading: false });
  },

  refreshProfile: async () => {
    const { userId } = get();
    if (userId) set({ profile: await loadProfile(userId) });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    const { userId, profile } = await signInAsGuest(DEFAULT_GUEST_NICKNAME);
    set({ userId, profile });
  },
}));
