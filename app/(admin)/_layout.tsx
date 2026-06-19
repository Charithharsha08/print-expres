import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

/**
 * Admin-only tab layout.
 * This layout is self-protecting: if a non-admin profile is detected
 * (e.g. navigation state restored to an admin route after clone/reinstall,
 *  or direct deep link), it immediately redirects the user out.
 */
export default function AdminLayout() {
  const { profile, initialized } = useAuthStore();

  useEffect(() => {
    // As soon as we know the user is not an admin (or signed out), eject them.
    // This is defense-in-depth in addition to the root AuthGuard.
    if (initialized && (!profile || profile.role !== 'admin')) {
      router.replace('/(customer)');
    }
  }, [profile, initialized]);

  // While we haven't confirmed the user is a real admin, render nothing.
  // This prevents any admin screens/tabs from mounting for normal users
  // even if the router tried to restore an admin route on startup.
  if (!initialized || !profile || profile.role !== 'admin') {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="promotions"
        options={{
          title: 'Promos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
