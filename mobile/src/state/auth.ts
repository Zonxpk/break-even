import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/db';

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

export const useAuth = create<AuthState>((set, get) => ({
  userId: null,
  profile: null,
  loading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id ?? null;
    set({ userId, profile: userId ? await loadProfile(userId) : null, loading: false });
    supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? null;
      set({ userId: id });
      if (id) loadProfile(id).then((profile) => set({ profile }));
      else set({ profile: null });
    });
  },

  signInGuest: async (nickname) => {
    const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { nickname } } });
    if (error) throw error;
    const userId = data.user!.id;
    set({ userId, profile: await loadProfile(userId), loading: false });
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
    set({ userId: null, profile: null });
  },
}));
