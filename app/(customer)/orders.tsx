import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SPACING, RADIUS, FONT_SIZE, ORDER_STATUS_META, SHADOWS } from '../../src/constants/theme';
import { subscribeToUserOrders } from '../../src/services/orderService';
import { Order } from '../../src/types';
import { initiatePayHerePayment } from '../../src/services/paymentService';

export default function OrdersScreen() {
  const { user, profile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // No WebView state needed — native PayHere SDK handles its own UI (requires custom dev client)

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserOrders(user.uid, (o) => { setOrders(o); setLoading(false); });
    return unsub;
  }, [user]);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return 'N/A';
    return ts.toDate().toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Native PayHere payment retry (uses the SDK, not WebView).
  // Requires the app to be a custom dev client build (expo-dev-client).
  // The paymentService updates Firestore status in the success/error/dismiss callbacks.
  const handleRetryPayHere = async (order: Order) => {
    const name = profile?.fullName || user?.displayName || 'Customer';
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const result = await initiatePayHerePayment({
      orderId: order.id,
      amount: order.totalPrice,
      items: order.productName || 'Print Order',
      firstName,
      lastName,
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      address:
        order.deliveryType === 'delivery'
          ? (order.deliveryAddress || '')
          : 'Store Pickup',
      city: 'Colombo',
      country: 'Sri Lanka',
    });

    if (result.success) {
      Alert.alert(
        'Payment Successful! 🎉',
        'Your payment was processed successfully. The order is now processing.'
      );
    } else {
      Alert.alert(
        'Payment Failed/Cancelled ❌',
        result.error || 'The payment was not completed.'
      );
    }
  };

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator color={COLORS.primary} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.count}>{orders.length} orders</Text>
      </Animated.View>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={60} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Place your first order to get started</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={orders}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: SPACING.lg, gap: 12 }}
            renderItem={({ item, index }) => {
              const meta = ORDER_STATUS_META[item.status] ?? ORDER_STATUS_META.pending;

              // Compute payment meta badge styles
              const getPaymentMeta = (method?: string, status?: string) => {
                if (status === 'paid') return { label: 'Paid', color: COLORS.success, bg: '#DCFCE7' };
                if (status === 'failed') return { label: 'Payment Failed', color: COLORS.error, bg: '#FEE2E2' };
                if (status === 'cash_on_delivery') {
                  return {
                    label: method === 'cod' ? 'Cash on Delivery' : 'Pay at Store',
                    color: COLORS.info,
                    bg: '#DBEAFE'
                  };
                }
                return { label: 'Payment Pending', color: COLORS.warning, bg: '#FEF3C7' };
              };

              const payMeta = getPaymentMeta(item.paymentMethod, item.paymentStatus);
              const showPayNow = item.paymentMethod === 'payhere' && item.paymentStatus !== 'paid' && item.status === 'pending';

              return (
                <Animated.View 
                  entering={FadeInDown.duration(400).delay(80 + index * 60)}
                  style={styles.orderCardContainer}
                >
                  <View style={styles.orderCard}>
                    <View style={styles.orderTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderProduct}>{item.productName}</Text>
                        <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                        <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                    </View>

                    {/* Payment Method & Status Badge */}
                    <View style={styles.paymentBadgeRow}>
                      <Text style={styles.paymentMethodLabel}>
                        Method:{' '}
                        <Text style={{ fontWeight: '600', color: COLORS.textPrimary }}>
                          {item.paymentMethod === 'payhere' ? 'Online' : item.paymentMethod === 'cod' ? 'Cash' : 'Store'}
                        </Text>
                      </Text>
                      <View style={[styles.payBadge, { backgroundColor: payMeta.bg }]}>
                        <Text style={[styles.payText, { color: payMeta.color }]}>{payMeta.label}</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.orderDetails}>
                      <View style={styles.detailItem}>
                        <Ionicons name="document-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{item.printSpec.copies} copies • {item.printSpec.paperSize} • {item.printSpec.color ? 'Color' : 'B&W'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name={item.deliveryType === 'delivery' ? 'bicycle-outline' : 'storefront-outline'} size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{item.deliveryType === 'delivery' ? 'Delivery' : 'Store Pickup'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
                      </View>
                    </View>
                    <View style={styles.orderFooter}>
                      <View>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>LKR {item.totalPrice.toFixed(0)}</Text>
                      </View>
                      {showPayNow && (
                        <TouchableOpacity
                          style={styles.payNowBtn}
                          onPress={() => handleRetryPayHere(item)}
                        >
                          <Ionicons name="card-outline" size={16} color="#fff" />
                          <Text style={styles.payNowBtnText}>Pay Now</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {item.designFileUrl && (
                      <View style={styles.designLink}>
                        <Ionicons name="cloud-outline" size={14} color={COLORS.info} />
                        <Text style={styles.designLinkText}>Design file uploaded</Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            }}
          />

        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.textPrimary },
  count: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  orderCardContainer: {
    paddingHorizontal: 0,
  },
  orderCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  orderProduct: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary },
  orderId: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: COLORS.surfaceAlt, marginVertical: SPACING.sm },
  orderDetails: { gap: 6 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.surfaceAlt },
  totalLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontWeight: '500' },
  totalValue: { fontSize: FONT_SIZE.base, fontWeight: '800', color: COLORS.accent, marginTop: 2 },
  designLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  designLinkText: { fontSize: FONT_SIZE.xs, color: COLORS.info, fontWeight: '500' },
  paymentBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  paymentMethodLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  payBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  payText: { fontSize: 10, fontWeight: '700' },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  payNowBtnText: {
    color: '#fff',
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
});
