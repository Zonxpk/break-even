import { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../state/auth';
import { theme } from '../ui/theme';

export default function RootLayout() {
  const { userId, loading, init } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    const onAuthScreen = segments[0] === 'sign-in';
    if (userId && onAuthScreen) router.replace('/');
  }, [userId, loading, segments]);

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="merch" />
      <Stack.Screen name="brand" />
      <Stack.Screen name="dating" />
      <Stack.Screen name="order" />
      <Stack.Screen name="track" />
      <Stack.Screen name="fail" />
      <Stack.Screen name="partner" options={{ presentation: 'modal', headerShown: true, title: 'ร่วมเป็นพาร์ทเนอร์' }} />
    </Stack>
  );

  if (Platform.OS !== 'web') return stack;

  return <View style={s.webShell}>{stack}</View>;
}

const s = StyleSheet.create({
  webShell: {
    flex: 1,
    width: '100%',
    maxWidth: theme.mobileWebWidth,
    alignSelf: 'center',
  },
});
