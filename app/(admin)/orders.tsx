import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, FONT_SIZE, ORDER_STATUS_META, SHADOWS } from '../../src/constants/theme';
import { subscribeToAllOrders, updateOrderStatus } from '../../src/services/orderService';
import { Order, OrderStatus } from '../../src/types';

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAllOrders((o) => { setOrders(o); setLoading(false); });
    return unsub;
  }, []);

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const handleStatusChange = (order: Order) => {
    const options = ALL_STATUSES.filter((s) => s !== order.status).map((s) => ({
      text: ORDER_STATUS_META[s]?.label ?? s,
      onPress: async () => {
        setUpdating(order.id);
        try { await updateOrderStatus(order.id, s); }
        catch (e: any) { Alert.alert('Error', e.message); }
        finally { setUpdating(null); }
      },
    }));
    Alert.alert('Update Status', `Current: ${ORDER_STATUS_META[order.status]?.label}`, [
      ...options,
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleDateString('en-LK', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.header}>
        <Text style={styles.title}>All Orders</Text>
        <Text style={styles.count}>{filtered.length} orders</Text>
      </Animated.View>

      {/* Status Filter */}
      {/* Status Filter Container */}
      <Animated.View entering={FadeInUp.duration(500).delay(80).springify()} style={{ height: 50, marginVertical: 8 }}>
        <FlatList
          data={["all", ...ALL_STATUSES] as any[]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            alignItems: "center", // This prevents children from stretching vertically!
            gap: 8,
          }}
          keyExtractor={(i) => i}
          renderItem={({ item }) => {
            const meta =
              item === "all"
                ? { label: "All", color: COLORS.primary }
                : ORDER_STATUS_META[item];
            const active = filterStatus === item;
            return (
              <TouchableOpacity
                onPress={() => setFilterStatus(item)}
                style={[
                  styles.filterChip,
                  active && {
                    backgroundColor: meta?.color ?? COLORS.primary,
                    borderColor: meta?.color ?? COLORS.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && { color: "#fff", fontWeight: "600" },
                  ]}
                >
                  {meta?.label ?? item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={50} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: SPACING.lg, gap: 12 }}
          renderItem={({ item: o, index }) => {
            const meta =
              ORDER_STATUS_META[o.status] ?? ORDER_STATUS_META.pending;

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
            const payMeta = getPaymentMeta(o.paymentMethod, o.paymentStatus);

            return (
              <Animated.View 
                entering={FadeInDown.duration(400).delay(150 + index * 50)}
                style={styles.cardContainer}
              >
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{o.productName}</Text>
                      <Text style={styles.orderId}>
                        #{o.id.slice(0, 10).toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.statusBtn, { backgroundColor: meta.bg }]}
                      onPress={() => handleStatusChange(o)}
                      disabled={updating === o.id}
                    >
                      {updating === o.id ? (
                        <ActivityIndicator size="small" color={meta.color} />
                      ) : (
                        <Text
                          style={[styles.statusBtnText, { color: meta.color }]}
                        >
                          {meta.label} ▾
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Payment Status Row */}
                  <View style={styles.paymentBadgeRow}>
                    <Text style={styles.paymentMethodLabel}>
                      Payment: <Text style={{ fontWeight: '600', color: COLORS.textPrimary }}>
                        {o.paymentMethod === 'payhere' ? 'PayHere' : o.paymentMethod === 'cod' ? 'Cash on Delivery' : o.paymentMethod === 'pay_at_store' ? 'Pay at Store' : 'N/A'}
                      </Text>
                    </Text>
                    <View style={[styles.payBadge, { backgroundColor: payMeta.bg }]}>
                      <Text style={[styles.payText, { color: payMeta.color }]}>{payMeta.label}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Ionicons
                        name="person-outline"
                        size={13}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.detailText}>
                        {o.userId.slice(0, 8)}...
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons
                        name="document-outline"
                        size={13}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.detailText}>
                        {o.printSpec.copies}x {o.printSpec.paperSize}{" "}
                        {o.printSpec.color ? "🎨" : "⬛"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons
                        name={
                          o.deliveryType === "delivery"
                            ? "bicycle-outline"
                            : "storefront-outline"
                        }
                        size={13}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.detailText}>{o.deliveryType}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.detailText}>
                        {formatDate(o.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {o.deliveryAddress && (
                    <View style={styles.addressRow}>
                      <Ionicons
                        name="location-outline"
                        size={13}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.addressText}>{o.deliveryAddress}</Text>
                    </View>
                  )}

                  {o.notes && (
                    <View style={styles.notesRow}>
                      <Ionicons
                        name="chatbox-outline"
                        size={13}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.notesText}>{o.notes}</Text>
                    </View>
                  )}

                  {o.designFileUrl && (
                    <View style={styles.designRow}>
                      <Ionicons
                        name="cloud-download-outline"
                        size={13}
                        color={COLORS.info}
                      />
                      <Text style={styles.designText}>
                        Design file on Cloudinary
                      </Text>
                    </View>
                  )}

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Total Amount</Text>
                    <Text style={styles.priceValue}>
                      LKR {o.totalPrice.toFixed(0)}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  count: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  filterText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyText: { color: COLORS.textMuted },
  cardContainer: {
    paddingHorizontal: 0,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  productName: {
    fontSize: FONT_SIZE.base,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  orderId: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    minWidth: 80,
    alignItems: "center",
  },
  statusBtnText: { fontSize: 11, fontWeight: "700" },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceAlt,
    marginVertical: SPACING.sm,
  },
  detailsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
  },
  addressText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, flex: 1 },
  notesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 4,
  },
  notesText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    flex: 1,
    fontStyle: "italic",
  },
  designRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  designText: { fontSize: FONT_SIZE.xs, color: COLORS.info, fontWeight: '500' },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
  },
  priceLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontWeight: '500' },
  priceValue: {
    fontSize: FONT_SIZE.base,
    fontWeight: "800",
    color: COLORS.accent,
  },
  paymentBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  paymentMethodLabel: { fontSize: 12, color: COLORS.textSecondary },
  payBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  payText: { fontSize: 10, fontWeight: '700' },
});
