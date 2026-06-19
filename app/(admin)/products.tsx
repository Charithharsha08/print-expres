import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal,
  ScrollView, Image, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';
import { subscribeToProducts, createProduct, updateProduct, deleteProduct } from '../../src/services/productService';
import { uploadToCloudinary } from '../../src/services/cloudinaryService';
import { Product } from '../../src/types';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';

const CATEGORIES = ['Business Cards', 'Flyers', 'Banners', 'Stickers', 'Brochures', 'Other'];

const emptyForm = { name: '', description: '', category: 'Business Cards', basePrice: '', available: true, imageUrl: '' };

export default function AdminProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToProducts((p) => { setProducts(p); setLoading(false); });
    return unsub;
  }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setImageUri(null); setModalVisible(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, category: p.category, basePrice: String(p.basePrice), available: p.available, imageUrl: p.imageUrl ?? '' });
    setImageUri(null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.basePrice) { Alert.alert('Missing fields', 'Name and price are required.'); return; }
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageUri) {
        setUploading(true);
        const res = await uploadToCloudinary(imageUri, 'printxpress/products');
        imageUrl = res.secure_url;
        setUploading(false);
      }
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        basePrice: parseFloat(form.basePrice) || 0,
        available: form.available,
        imageUrl: imageUrl || undefined,
      };
      if (editing) { await updateProduct(editing.id, payload); }
      else { await createProduct(payload); }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = (p: Product) => {
    Alert.alert('Delete Product', `Delete "${p.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteProduct(p.id); } catch (e: any) { Alert.alert('Error', e.message); } } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add Product</Text>
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: SPACING.lg, gap: 12 }}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="cube-outline" size={50} color={COLORS.textMuted} /><Text style={styles.emptyText}>No products yet</Text></View>}
          renderItem={({ item: p, index }) => (
            <Animated.View 
              entering={FadeInDown.duration(400).delay(100 + index * 60)}
              style={styles.cardContainer}
            >
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  {p.imageUrl ? (
                    <Image source={{ uri: p.imageUrl }} style={styles.productImg} />
                  ) : (
                    <View style={[styles.productImg, styles.productImgPlaceholder]}>
                      <Ionicons name="image-outline" size={24} color={COLORS.textMuted} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productCat}>{p.category}</Text>
                    <Text style={styles.productPrice}>LKR {p.basePrice.toFixed(0)}</Text>
                    <View style={[styles.availBadge, { backgroundColor: p.available ? '#DCFCE7' : '#FEE2E2' }]}>
                      <Text style={[styles.availText, { color: p.available ? COLORS.success : COLORS.error }]}>
                        {p.available ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(p)}>
                    <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleDelete(p)}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Product' : 'New Product'}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Image Upload */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {(imageUri || form.imageUrl) ? (
                <Image source={{ uri: imageUri ?? form.imageUrl }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
                  <Text style={styles.imagePickerText}>Upload to Cloudinary</Text>
                  <Text style={styles.imagePickerSub}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>
            {uploading && (
              <View style={styles.uploadingRow}>
                <ActivityIndicator size="small" color={COLORS.accent} />
                <Text style={styles.uploadingText}>Uploading to Cloudinary...</Text>
              </View>
            )}

            <Input label="Product Name *" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="e.g. A4 Full Color Flyer" autoCapitalize="words" />
            <Input label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Product description..." multiline numberOfLines={3} autoCapitalize="sentences" />
            <Input label="Base Price (LKR) *" value={form.basePrice} onChangeText={(v) => setForm({ ...form, basePrice: v })} placeholder="0.00" keyboardType="decimal-pad" />

            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: SPACING.md }}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity key={c} style={[styles.catChip, form.category === c && styles.catChipActive]} onPress={() => setForm({ ...form, category: c })}>
                  <Text style={[styles.catText, form.category === c && styles.catTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>Available for orders</Text>
              <Switch value={form.available} onValueChange={(v) => setForm({ ...form, available: v })} trackColor={{ true: COLORS.primary }} />
            </View>

            <Button title={editing ? 'Save Changes' : 'Create Product'} onPress={handleSave} loading={saving} size="lg" />
            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.textPrimary },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.full },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.sm },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { color: COLORS.textMuted },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardLeft: { flex: 1, flexDirection: 'row', gap: 12 },
  productImg: { width: 70, height: 70, borderRadius: RADIUS.md },
  productImgPlaceholder: { backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  productName: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary },
  productCat: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  productPrice: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.accent, marginTop: 4 },
  availBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, marginTop: 4 },
  availText: { fontSize: 10, fontWeight: '700' },
  cardActions: { gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  modalContent: { padding: SPACING.lg },
  imagePicker: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed' },
  imagePreview: { width: '100%', height: 180, resizeMode: 'cover' },
  imagePlaceholder: { height: 140, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePickerText: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.primary },
  imagePickerSub: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  uploadingText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  fieldLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surfaceAlt },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '500' },
  catTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
});
