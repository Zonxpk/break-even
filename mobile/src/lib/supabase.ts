import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!url || !anonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env');
}
if (!/^https?:\/\/.+/i.test(url)) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL must be a full https URL (e.g. https://YOUR_REF.supabase.co)');
}
if (!/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(anonKey)) {
  throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY must be the Supabase anon JWT from Dashboard → Settings → API (not a search command output)');
}

const isBrowser = typeof window !== 'undefined';

/** AsyncStorage touches `window` on web; noop during Expo Router SSR. */
const authStorage: SupportedStorage = {
  getItem: (key) => (isBrowser ? AsyncStorage.getItem(key) : Promise.resolve(null)),
  setItem: (key, value) => (isBrowser ? AsyncStorage.setItem(key, value) : Promise.resolve()),
  removeItem: (key) => (isBrowser ? AsyncStorage.removeItem(key) : Promise.resolve()),
};

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: isBrowser,
    persistSession: isBrowser,
    detectSessionInUrl: false,
  },
});
