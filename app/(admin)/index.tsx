import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SPACING, RADIUS, FONT_SIZE, ORDER_STATUS_META, SHADOWS } from '../../src/constants/theme';
import { subscribeToAllOrders } from '../../src/services/orderService';
import { subscribeToProducts } from '../../src/services/productService';
import { Order } from '../../src/types';

export default function AdminDashboard() {
  const { profile, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = subscribeToAllOrders((o) => { setOrders(o); setLoading(false); });
    const unsubProducts = subscribeToProducts((p) => setProductCount(p.length));
    return () => { unsubOrders(); unsubProducts(); };
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    revenue: orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalPrice, 0),
  };

  const recentOrders = orders.slice(0, 5);

  const StatCard = ({ icon, label, value, color, idx }: any) => (
    <Animated.View 
      entering={FadeInDown.duration(450).delay(100 + idx * 50).springify()}
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Control Panel</Text>
          <Text style={styles.name}>{profile?.fullName}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard icon="receipt-outline" label="Total Orders" value={stats.total} color={COLORS.primary} idx={0} />
              <StatCard icon="hourglass-outline" label="Pending" value={stats.pending} color={COLORS.warning} idx={1} />
              <StatCard icon="settings-outline" label="Processing" value={stats.processing} color={COLORS.info} idx={2} />
              <StatCard icon="cube-outline" label="Products" value={productCount} color={COLORS.success} idx={3} />
            </View>

            {/* Revenue */}
            <Animated.View entering={ZoomIn.duration(600).delay(250).springify()} style={styles.revCard}>
              <View>
                <Text style={styles.revLabel}>Total Estimated Revenue</Text>
                <Text style={styles.revValue}>LKR {stats.revenue.toFixed(0)}</Text>
                <Text style={styles.revSub}>Calculated from {stats.total - orders.filter((o) => o.status === 'cancelled').length} active orders</Text>
              </View>
              <Ionicons name="trending-up-outline" size={48} color="rgba(255,255,255,0.2)" />
            </Animated.View>

            {/* Recent Orders */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              {recentOrders.length === 0 ? (
                <Text style={styles.noData}>No orders yet</Text>
              ) : (
                recentOrders.map((o, idx) => {
                  const meta = ORDER_STATUS_META[o.status] ?? ORDER_STATUS_META.pending;
                  return (
                    <Animated.View 
                      key={o.id}
                      entering={FadeInDown.duration(450).delay(300 + idx * 50)}
                      style={styles.orderRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderProduct}>{o.productName}</Text>
                        <Text style={styles.orderId}>#{o.id.slice(0, 8).toUpperCase()}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                        <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                      <Text style={styles.orderPrice}>LKR {o.totalPrice.toFixed(0)}</Text>
                    </Animated.View>
                  );
                })
              )}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  greeting: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  name: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.textPrimary, marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm, gap: 12 },
  statCard: { width: '48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4, ...SHADOWS.sm },
  statIcon: { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  revCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...SHADOWS.md },
  revLabel: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  revValue: { fontSize: 24, fontWeight: '800', color: '#fff', marginVertical: 4 },
  revSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  noData: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.lg },
  orderRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  orderProduct: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.textPrimary },
  orderId: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  badgeText: { fontSize: 9, fontWeight: '700' },
  orderPrice: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: COLORS.accent },
});
