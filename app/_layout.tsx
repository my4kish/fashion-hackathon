import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
  GeistMono_600SemiBold,
} from '@expo-google-fonts/geist-mono';
import { useAuthStore } from '../src/store/auth.store';
import { UserRole } from '../src/types';

SplashScreen.preventAutoHideAsync();

const ROLE_ROUTES: Record<UserRole, string> = {
  customer: '/(customer)',
  franchisee: '/(franchisee)',
  production: '/(production)',
};

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const initialized = useAuthStore((s) => s.initialized);
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Anton_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      initialize().then(() => SplashScreen.hideAsync());
    }
  }, [fontsLoaded]);

  // Auth guard — runs when auth state or segments change
  useEffect(() => {
    if (!initialized || !fontsLoaded) return;

    const firstSegment = segments[0] as string | undefined;
    const isOnWelcome = !firstSegment || firstSegment === 'index' || firstSegment === 'welcome';
    const isInAuth = firstSegment === '(auth)';
    const isInRoleGroup = firstSegment === '(customer)' || firstSegment === '(franchisee)' || firstSegment === '(production)';

    if (!session) {
      if (isInRoleGroup) {
        router.replace('/welcome' as any);
      }
      return;
    }

    const role = profile?.role;

    if (!role) {
      if (!isInAuth) {
        router.replace('/(auth)/role-select' as any);
      }
      return;
    }

    const correctRoute = ROLE_ROUTES[role];
    const currentRoleGroup = isInRoleGroup ? `/${firstSegment}` : null;

    if (isOnWelcome || isInAuth) {
      router.replace(correctRoute as any);
    } else if (currentRoleGroup && currentRoleGroup !== correctRoute) {
      router.replace(correctRoute as any);
    }
  }, [initialized, fontsLoaded, session, profile?.role, segments[0]]);

  if (!fontsLoaded || !initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
