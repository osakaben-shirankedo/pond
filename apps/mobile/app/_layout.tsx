import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { authStorage } from '@/services/auth';
import { api } from '@/services/api';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: 'login',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    (async () => {
      const token = await authStorage.getToken();
      if (!token) {
        SplashScreen.hideAsync();
        router.replace('/login');
        return;
      }

      const { error } = await api.get('/profile', token);
      SplashScreen.hideAsync();

      if (error === 'NETWORK_ERROR') {
        // サーバー未起動でもアプリを使えるようにタブへ
        router.replace('/(tabs)');
      } else if (error === 'PROFILE_NOT_FOUND') {
        router.replace('/login');
      } else if (error) {
        // トークン無効など
        await authStorage.clear();
        router.replace('/login');
      } else {
        router.replace('/(tabs)');
      }
    })();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="assessment" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pond-chat" />
        <Stack.Screen name="new-post" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="dark" backgroundColor="#f7f9ff" />
    </>
  );
}
