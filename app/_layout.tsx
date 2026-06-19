import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore, initAuthListener } from '../src/store/authStore';
import { COLORS } from '../src/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function AuthGuard() {
  const { user, profile, initialized } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inCustomerGroup = segments[0] === '(customer)';

    // No user (logged out or guest): never allow admin area.
    // Allow browsing (customer) as guest, and of course the auth screens.
    if (!user) {
      if (inAdminGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // User is logged in but we have no profile yet (or fetch failed).
    // Kick to login so they can re-auth / we can re-fetch profile.
    if (!profile) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Logged in + profile loaded → enforce role-based routing strictly.
    const role = profile.role;
    const isAdmin = role === 'admin';

    if (isAdmin) {
      // Admin must be in the admin group. Eject from customer/auth if needed.
      if (!inAdminGroup) {
        router.replace('/(admin)');
      }
    } else {
      // Non-admin (customer or unknown role) must never see admin.
      // If they are in admin (e.g. restored route after clone/restart), eject.
      if (inAdminGroup) {
        router.replace('/(customer)');
      } else if (inAuthGroup) {
        // Coming from login/register → send customers to the app
        router.replace('/(customer)');
      }
      // If already in customer, do nothing.
    }
  }, [user, profile, initialized, segments]);

  return null;
}

export default function RootLayout() {
  const { loading, initialized } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
