import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { createOrder } from '../../src/services/orderService';
import { uploadDesignFile } from '../../src/services/cloudinaryService';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { initiatePayHerePayment } from '../../src/services/paymentService';

const PAPER_SIZES = ['A4', 'A3', 'A5', 'Letter', 'Legal'];
const BINDING_OPTS = ['none', 'spiral', 'staple'];

export default function PlaceOrderScreen() {
  const { productId, productName, basePrice } = useLocalSearchParams<{ productId: string; productName: string; basePrice: string }>();
  const { user, profile } = useAuthStore();

  const [paperSize, setPaperSize] = useState('A4');
  const [color, setColor] = useState(true);
  const [copies, setCopies] = useState('1');
  const [doubleSided, setDoubleSided] = useState(false);
  const [binding, setBinding] = useState('none');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [designUri, setDesignUri] = useState<string | null>(null);
  const [designMime, setDesignMime] = useState('image/jpeg');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Payment method (payhere uses the native SDK; no WebView state needed)
  const [paymentMethod, setPaymentMethod] = useState<'payhere' | 'cod' | 'pay_at_store'>('pay_at_store');

  // Sync payment method default based on delivery type
  useEffect(() => {
    if (deliveryType === 'delivery') {
      setPaymentMethod('payhere');
    } else {
      setPaymentMethod('pay_at_store');
    }
  }, [deliveryType]);

  const price = parseFloat(basePrice ?? '0');
  const copiesNum = parseInt(copies) || 1;
  const totalPrice = price * copiesNum * (color ? 1.5 : 1) * (doubleSided ? 0.9 : 1);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) { setDesignUri(res.assets[0].uri); setDesignMime('image/jpeg'); }
  };

  const pickDocument = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!res.canceled) { setDesignUri(res.assets[0].uri); setDesignMime('application/pdf'); }
  };


  const handleSubmit = async () => {
    if (!user) return;
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      Alert.alert('Missing Info', 'Please enter a delivery address.'); return;
    }
    setSubmitting(true);
    try {
      let designFileUrl: string | undefined;
      if (designUri) {
        setUploading(true);
        const result = await uploadDesignFile(designUri, designMime);
        designFileUrl = result.secure_url;
        setUploading(false);
      }

      const initialPaymentStatus = paymentMethod === 'payhere'
        ? 'pending'
        : 'cash_on_delivery';

      const orderId = await createOrder({
        userId: user.uid,
        productId: productId ?? "",
        productName: productName ?? "",
        printSpec: {
          paperSize,
          color,
          copies: copiesNum,
          doubleSided,
          binding,
        },
        deliveryType,
        deliveryAddress:
          deliveryType === "delivery" ? deliveryAddress : undefined,
        totalPrice: Math.round(totalPrice * 100) / 100,
        notes: notes.trim() || undefined,
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        ...(designFileUrl ? { designFileUrl } : {}),
      });

      if (paymentMethod === 'payhere') {
        // Use the native PayHere SDK (requires custom dev client build with expo-dev-client).
        // This will NOT work if running inside plain Expo Go.
        const name = profile?.fullName || user?.displayName || 'Customer';
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        const result = await initiatePayHerePayment({
          orderId,
          amount: Math.round(totalPrice * 100) / 100,
          items: productName ?? 'Custom Print Job',
          firstName,
          lastName,
          email: profile?.email || user?.email || '',
          phone: profile?.phone || '',
          address:
            deliveryType === 'delivery'
              ? deliveryAddress?.trim() || 'No. 20, Main Street'
              : 'Store Pickup',
          city: 'Colombo',
          country: 'Sri Lanka',
        });

        if (result.success) {
          Alert.alert('Payment Successful! 🎉', 'Your order has been placed and paid successfully.', [
            { text: 'View Orders', onPress: () => router.replace('/(customer)/orders' as any) },
          ]);
        } else {
          Alert.alert(
            'Payment Failed/Cancelled ❌',
            result.error || 'The payment was not completed. You can try again from the My Orders section.',
            [{ text: 'View Orders', onPress: () => router.replace('/(customer)/orders' as any) }]
          );
        }
      } else {
        Alert.alert('Order Placed! 🎉', 'Your order has been submitted successfully.', [
          { text: 'View Orders', onPress: () => router.replace('/(customer)/orders' as any) },
        ]);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message ?? 'Failed to place order.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Place Order</Text>
        <View style={{ width: 24 }} />
      </Animated.View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Product */}
        <Animated.View entering={FadeInDown.duration(500).delay(80).springify()} style={styles.productBanner}>
          <View style={styles.productIconWrap}>
            <Ionicons name="cube-outline" size={24} color={COLORS.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.productLabel}>Selected Product</Text>
            <Text style={styles.productName}>{productName}</Text>
          </View>
          <Text style={styles.basePriceText}>LKR {price.toFixed(0)}</Text>
        </Animated.View>

        {/* Design Upload */}
        <Animated.View entering={FadeInDown.duration(500).delay(120).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Upload Design (Optional)</Text>
          <Text style={styles.cardSub}>Cloudinary • Supports JPG, PNG, PDF</Text>
          {designUri ? (
            <View style={styles.designPreview}>
              {designMime !== 'application/pdf' ? (
                <Image source={{ uri: designUri }} style={styles.designImage} resizeMode="contain" />
              ) : (
                <View style={styles.pdfPreview}>
                  <Ionicons name="document-outline" size={40} color={COLORS.accent} />
                  <Text style={styles.pdfText}>PDF selected</Text>
                </View>
              )}
              <TouchableOpacity style={styles.removeDesign} onPress={() => setDesignUri(null)}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadBtns}>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color={COLORS.primary} />
                <Text style={styles.uploadBtnText}>Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
                <Ionicons name="document-outline" size={22} color={COLORS.primary} />
                <Text style={styles.uploadBtnText}>PDF</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Print Specs */}
        <Animated.View entering={FadeInDown.duration(500).delay(160).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Print Specifications</Text>

          <Text style={styles.fieldLabel}>Paper Size</Text>
          <View style={styles.optionRow}>
            {PAPER_SIZES.map((s) => (
              <TouchableOpacity key={s} style={[styles.optionChip, paperSize === s && styles.optionChipActive]} onPress={() => setPaperSize(s)}>
                <Text style={[styles.optionText, paperSize === s && styles.optionTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Copies</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => setCopies(String(Math.max(1, copiesNum - 1)))}>
              <Ionicons name="remove" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.counterVal}>{copies}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => setCopies(String(copiesNum + 1))}>
              <Ionicons name="add" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Color Print</Text>
            <Switch value={color} onValueChange={setColor} trackColor={{ true: COLORS.primary }} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Double-Sided</Text>
            <Switch value={doubleSided} onValueChange={setDoubleSided} trackColor={{ true: COLORS.primary }} />
          </View>

          <Text style={styles.fieldLabel}>Binding</Text>
          <View style={styles.optionRow}>
            {BINDING_OPTS.map((b) => (
              <TouchableOpacity key={b} style={[styles.optionChip, binding === b && styles.optionChipActive]} onPress={() => setBinding(b)}>
                <Text style={[styles.optionText, binding === b && styles.optionTextActive]}>{b.charAt(0).toUpperCase() + b.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Delivery */}
        <Animated.View entering={FadeInDown.duration(500).delay(200).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Delivery / Pickup</Text>
          <View style={styles.optionRow}>
            {(['pickup', 'delivery'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.deliveryOpt, deliveryType === t && styles.deliveryOptActive]} onPress={() => setDeliveryType(t)}>
                <Ionicons name={t === 'pickup' ? 'storefront-outline' : 'bicycle-outline'} size={20} color={deliveryType === t ? '#fff' : COLORS.primary} />
                <Text style={[styles.deliveryOptText, deliveryType === t && { color: '#fff' }]}>{t === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {deliveryType === 'delivery' && (
            <View style={{ marginTop: 12 }}>
              <Input label="Delivery Address" value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Enter full street address" autoCapitalize="words" multiline numberOfLines={3} />
            </View>
          )}
        </Animated.View>

        {/* Payment Method */}
        <Animated.View entering={FadeInDown.duration(500).delay(240).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <Text style={styles.cardSub}>Select how you'd like to pay</Text>

          <View style={{ gap: 10, marginTop: 4 }}>
            {/* Pay Online */}
            <TouchableOpacity
              style={[
                styles.paymentOpt,
                paymentMethod === 'payhere' && styles.paymentOptActive
              ]}
              onPress={() => setPaymentMethod('payhere')}
            >
              <View style={styles.paymentOptLeft}>
                <Ionicons name="card-outline" size={22} color={paymentMethod === 'payhere' ? '#fff' : COLORS.primary} />
                <View>
                  <Text style={[styles.paymentOptTitle, paymentMethod === 'payhere' && { color: '#fff' }]}>Pay Online (PayHere)</Text>
                  <Text style={[styles.paymentOptSub, paymentMethod === 'payhere' && { color: 'rgba(255,255,255,0.7)' }]}>Visa, MasterCard, AMEX, Genie</Text>
                </View>
              </View>
              <Ionicons
                name={paymentMethod === 'payhere' ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={paymentMethod === 'payhere' ? '#fff' : COLORS.textMuted}
              />
            </TouchableOpacity>

            {/* Pay on Delivery/Store */}
            {deliveryType === 'delivery' ? (
              <TouchableOpacity
                style={[
                  styles.paymentOpt,
                  paymentMethod === 'cod' && styles.paymentOptActive
                ]}
                onPress={() => setPaymentMethod('cod')}
              >
                <View style={styles.paymentOptLeft}>
                  <Ionicons name="cash-outline" size={22} color={paymentMethod === 'cod' ? '#fff' : COLORS.primary} />
                  <View>
                    <Text style={[styles.paymentOptTitle, paymentMethod === 'cod' && { color: '#fff' }]}>Cash on Delivery</Text>
                    <Text style={[styles.paymentOptSub, paymentMethod === 'cod' && { color: 'rgba(255,255,255,0.7)' }]}>Pay in cash upon delivery</Text>
                  </View>
                </View>
                <Ionicons
                  name={paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={paymentMethod === 'cod' ? '#fff' : COLORS.textMuted}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.paymentOpt,
                  paymentMethod === 'pay_at_store' && styles.paymentOptActive
                ]}
                onPress={() => setPaymentMethod('pay_at_store')}
              >
                <View style={styles.paymentOptLeft}>
                  <Ionicons name="storefront-outline" size={22} color={paymentMethod === 'pay_at_store' ? '#fff' : COLORS.primary} />
                  <View>
                    <Text style={[styles.paymentOptTitle, paymentMethod === 'pay_at_store' && { color: '#fff' }]}>Pay at Store</Text>
                    <Text style={[styles.paymentOptSub, paymentMethod === 'pay_at_store' && { color: 'rgba(255,255,255,0.7)' }]}>Pay by cash/card at pickup</Text>
                  </View>
                </View>
                <Ionicons
                  name={paymentMethod === 'pay_at_store' ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={paymentMethod === 'pay_at_store' ? '#fff' : COLORS.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Notes */}
        <Animated.View entering={FadeInDown.duration(500).delay(280).springify()} style={styles.card}>
          <Input label="Additional Notes (Optional)" value={notes} onChangeText={setNotes} placeholder="Any special instructions..." multiline numberOfLines={3} />
        </Animated.View>

        {/* Price Summary */}
        <Animated.View entering={FadeInDown.duration(500).delay(320).springify()} style={styles.priceSummary}>
          <Text style={styles.priceLabel}>Estimated Total</Text>
          <Text style={styles.priceValue}>LKR {totalPrice.toFixed(2)}</Text>
        </Animated.View>

        {uploading && (
          <View style={styles.uploadingBanner}>
            <ActivityIndicator color={COLORS.accent} size="small" />
            <Text style={styles.uploadingText}>Uploading design to Cloudinary...</Text>
          </View>
        )}

        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: 40 }}>
          <Button title="Place Order" onPress={handleSubmit} loading={submitting} size="lg" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, ...SHADOWS.sm },
  topTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { flex: 1 },
  productBanner: { margin: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 12, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border },
  productIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  productLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  productName: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  basePriceText: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.accent },
  card: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginBottom: SPACING.md },
  designPreview: { position: 'relative', alignItems: 'center', marginTop: 4 },
  designImage: { width: '100%', height: 160, borderRadius: RADIUS.md },
  pdfPreview: { alignItems: 'center', paddingVertical: SPACING.lg, gap: 8, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, width: '100%' },
  pdfText: { color: COLORS.textSecondary, fontWeight: '600' },
  removeDesign: { position: 'absolute', top: -10, right: -10, backgroundColor: '#fff', borderRadius: 12 },
  uploadBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  uploadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed' },
  uploadBtnText: { color: COLORS.primary, fontWeight: '600' },
  fieldLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  optionChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#F8FAFC' },
  optionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '600' },
  optionTextActive: { color: '#fff' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  counterBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  counterVal: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary, minWidth: 32, textAlign: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceAlt },
  switchLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '600' },
  deliveryOpt: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#F8FAFC' },
  deliveryOptActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  deliveryOptText: { fontWeight: '700', color: COLORS.primary },
  priceSummary: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.md },
  priceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.sm, fontWeight: '500' },
  priceValue: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '800' },
  uploadingBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surfaceAlt, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, padding: SPACING.sm, borderRadius: RADIUS.md },
  uploadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  paymentOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  paymentOptActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentOptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentOptTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  paymentOptSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
