import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';
import { subscribeToProducts } from '../../src/services/productService';
import { subscribeToPromotions } from '../../src/services/promotionService';
import { Product, Promotion } from '../../src/types';

export default function CustomerHomeScreen() {
  const { profile } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProducts = subscribeToProducts((p) => {
      setProducts(p.filter((x) => x.available).slice(0, 6));
      setLoading(false);
    });
    const unsubPromos = subscribeToPromotions((p) => {
      setPromotions(p.filter((x) => x.active).slice(0, 3));
    });
    return () => { unsubProducts(); unsubPromos(); };
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(100).springify()}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{profile?.fullName?.split(' ')[0] ?? 'Customer'} </Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(customer)/orders' as any)}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Banner */}
        <Animated.View 
          entering={ZoomIn.duration(600).delay(150).springify()}
          style={styles.heroBanner}
        >
          <Text style={styles.heroTitle}>Print It.{'\n'}Your Way.</Text>
          <Text style={styles.heroSub}>Fast, quality prints delivered to your door</Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/(customer)/products' as any)}>
            <Text style={styles.heroBtnText}>Browse Products</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="print-outline" size={110} color="rgba(255,255,255,0.12)" style={styles.heroIcon} />
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: 'grid-outline', label: 'Browse', route: '/(customer)/products', color: '#EEF2FF', iconColor: '#4F46E5' },
              { icon: 'receipt-outline', label: 'My Orders', route: '/(customer)/orders', color: '#ECFDF5', iconColor: '#10B981' },
              { icon: 'document-text-outline', label: 'Guidelines', route: '/(customer)/guidelines', color: '#FFF7ED', iconColor: '#F97316' },
              { icon: 'chatbubble-outline', label: 'Support', route: '/(customer)/support', color: '#FDF2F8', iconColor: '#EC4899' },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.quickItem} onPress={() => router.push(item.route as any)}>
                <View style={[styles.quickIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Active Promotions */}
        {promotions.length > 0 && (
          <Animated.View 
            entering={FadeInDown.duration(600).delay(250).springify()}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>🔥 Active Offers</Text>
            <FlatList
              data={promotions}
              renderItem={({ item }) => (
                <View style={styles.promoCard}>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>{item.discountPercent}% OFF</Text>
                  </View>
                  <Text style={styles.promoTitle}>{item.title}</Text>
                  <Text style={styles.promoDesc} numberOfLines={2}>{item.description}</Text>
                </View>
              )}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: SPACING.lg }}
            />
          </Animated.View>
        )}

        {/* Featured Products */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(300).springify()}
          style={styles.section}
        >
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/products' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : products.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No products available yet</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.map((product, idx) => (
                <Animated.View 
                  entering={FadeInDown.duration(500).delay(350 + idx * 80)}
                  key={product.id}
                  style={styles.productCardContainer}
                >
                  <TouchableOpacity
                    style={styles.productCard}
                    onPress={() => router.push({ pathname: '/(customer)/place-order' as any, params: { productId: product.id, productName: product.name, basePrice: product.basePrice } })}
                  >
                    {product.imageUrl ? (
                      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                    ) : (
                      <View style={[styles.productImage, styles.productImagePlaceholder]}>
                        <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
                      </View>
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.productCategory}>{product.category}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>LKR {product.basePrice.toFixed(0)}</Text>
                        <View style={styles.addBtnIcon}>
                          <Ionicons name="add" size={14} color="#fff" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  greeting: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '500' },
  userName: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.textPrimary, marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border },
  heroBanner: { marginHorizontal: SPACING.lg, marginTop: SPACING.md, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.xl, overflow: 'hidden', minHeight: 160, ...SHADOWS.md },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 32 },
  heroSub: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.7)', marginTop: 6, marginBottom: SPACING.lg },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.accent, alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: 10, borderRadius: RADIUS.full },
  heroBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  heroIcon: { position: 'absolute', right: -15, bottom: -15 },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  seeAll: { fontSize: FONT_SIZE.sm, color: COLORS.accent, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickItem: { alignItems: 'center', gap: 6, flex: 1 },
  quickIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  quickLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  promoCard: { width: 220, backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOWS.md },
  promoBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  promoBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  promoTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: '#fff', marginBottom: 4 },
  promoDesc: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.85)' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  productCardContainer: { width: '48%' },
  productCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm, flex: 1 },
  productImage: { width: '100%', height: 110 },
  productImagePlaceholder: { backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  productInfo: { padding: SPACING.sm },
  productName: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.textPrimary },
  productCategory: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  productPrice: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: COLORS.accent },
  addBtnIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.sm },
});
