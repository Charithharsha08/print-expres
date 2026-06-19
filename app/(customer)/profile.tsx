import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';
import Button from '../../src/components/common/Button';

export default function ProfileScreen() {
  const { profile, logout } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          setLoggingOut(true);
          await logout();
          router.replace('/(auth)/login');
        }
      },
    ]);
  };

  const initials = profile?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  const MenuItem = ({ icon, label, onPress, danger = false }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && { backgroundColor: '#FEE2E2' }]}>
        <Ionicons name={icon} size={20} color={danger ? COLORS.error : COLORS.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </Animated.View>

        {/* Avatar */}
        <Animated.View entering={ZoomIn.duration(600).delay(80).springify()} style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile?.fullName}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="person-outline" size={12} color={COLORS.primary} />
            <Text style={styles.roleText}>Customer Account</Text>
          </View>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(150).springify()} style={styles.infoCard}>
          {[
            { icon: 'mail-outline', label: 'Email Address', value: profile?.email, color: '#EEF2FF' },
            { icon: 'call-outline', label: 'Phone Number', value: profile?.phone || 'Not set', color: '#ECFDF5' },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Menu */}
        <Animated.View entering={FadeInDown.duration(500).delay(220).springify()} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="receipt-outline" label="My Orders" onPress={() => router.push('/(customer)/orders' as any)} />
            <MenuItem icon="document-text-outline" label="Print Guidelines" onPress={() => router.push('/(customer)/guidelines' as any)} />
            <MenuItem icon="chatbubble-outline" label="Contact Support" onPress={() => router.push('/(customer)/support' as any)} />
          </View>
          <View style={styles.menuCard}>
            <MenuItem icon="log-out-outline" label="Log Out" onPress={handleLogout} danger />
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PrintXpress v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.textPrimary },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...SHADOWS.md },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, backgroundColor: '#E0E7FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  roleText: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: '600' },
  infoCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, gap: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  infoValue: { fontSize: FONT_SIZE.base, color: COLORS.textPrimary, fontWeight: '600' },
  menuSection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  menuSectionTitle: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 1 },
  menuCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, ...SHADOWS.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceAlt, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FONT_SIZE.base, color: COLORS.textPrimary, fontWeight: '500' },
  footer: { alignItems: 'center', paddingVertical: SPACING.xl },
  footerText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
});
