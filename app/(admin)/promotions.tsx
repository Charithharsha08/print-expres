import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../src/constants/theme';
import { subscribeToPromotions, createPromotion, updatePromotion, deletePromotion } from '../../src/services/promotionService';
import { Promotion } from '../../src/types';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';

const emptyForm = { title: '', description: '', discountPercent: '', validUntil: '', active: true };

export default function AdminPromotionsScreen() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToPromotions((p) => { setPromos(p); setLoading(false); });
    return unsub;
  }, []);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return 'N/A';
    return ts.toDate().toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isExpired = (ts: any) => {
    if (!ts?.toDate) return false;
    return ts.toDate() < new Date();
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalVisible(true); };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    const d = p.validUntil?.toDate?.();
    setForm({
      title: p.title,
      description: p.description,
      discountPercent: String(p.discountPercent),
      validUntil: d ? d.toISOString().split('T')[0] : '',
      active: p.active,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.discountPercent || !form.validUntil) {
      Alert.alert('Missing fields', 'Title, discount, and valid-until date are required.'); return;
    }
    const discount = parseFloat(form.discountPercent);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      Alert.alert('Invalid discount', 'Discount must be between 1 and 100.'); return;
    }
    const date = new Date(form.validUntil);
    if (isNaN(date.getTime())) { Alert.alert('Invalid date', 'Please enter a valid date (YYYY-MM-DD).'); return; }

    setSaving(true);
    try {
      const payload = { title: form.title.trim(), description: form.description.trim(), discountPercent: discount, validUntil: date, active: form.active };
      if (editing) { await updatePromotion(editing.id, payload); }
      else { await createPromotion(payload); }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (p: Promotion) => {
    Alert.alert('Delete Promotion', `Delete "${p.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deletePromotion(p.id); } catch (e: any) { Alert.alert('Error', e.message); } } },
    ]);
  };

  const handleToggleActive = async (p: Promotion) => {
    try { await updatePromotion(p.id, { active: !p.active }); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Promotions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={promos}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: SPACING.lg, gap: 12 }}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="pricetag-outline" size={50} color={COLORS.textMuted} /><Text style={styles.emptyText}>No promotions yet</Text></View>}
          renderItem={({ item: p }) => {
            const expired = isExpired(p.validUntil);
            return (
              <View style={[styles.card, !p.active && styles.cardInactive]}>
                <View style={styles.cardTop}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{p.discountPercent}%</Text>
                    <Text style={styles.discountOff}>OFF</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.promoTitle}>{p.title}</Text>
                    <Text style={styles.promoDesc} numberOfLines={2}>{p.description}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={12} color={expired ? COLORS.error : COLORS.textMuted} />
                      <Text style={[styles.metaText, expired && { color: COLORS.error }]}>
                        {expired ? 'Expired ' : 'Valid until '}{formatDate(p.validUntil)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.switchRow}>
                    <Text style={styles.activeLabel}>{p.active ? 'Active' : 'Inactive'}</Text>
                    <Switch value={p.active} onValueChange={() => handleToggleActive(p)} trackColor={{ true: COLORS.success }} />
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(p)}>
                      <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleDelete(p)}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Promotion' : 'New Promotion'}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Input label="Title *" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="e.g. Summer Sale" autoCapitalize="words" />
            <Input label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Describe the promotion..." multiline numberOfLines={3} autoCapitalize="sentences" />
            <Input label="Discount % *" value={form.discountPercent} onChangeText={(v) => setForm({ ...form, discountPercent: v })} placeholder="e.g. 20" keyboardType="decimal-pad" />
            <Input label="Valid Until * (YYYY-MM-DD)" value={form.validUntil} onChangeText={(v) => setForm({ ...form, validUntil: v })} placeholder="2025-12-31" keyboardType="numbers-and-punctuation" />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Active</Text>
              <Switch value={form.active} onValueChange={(v) => setForm({ ...form, active: v })} trackColor={{ true: COLORS.primary }} />
            </View>
            <Button title={editing ? 'Save Changes' : 'Create Promotion'} onPress={handleSave} loading={saving} size="lg" />
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
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardInactive: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', gap: 14, marginBottom: SPACING.sm },
  discountBadge: { width: 64, height: 64, borderRadius: RADIUS.lg, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  discountText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  discountOff: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  promoTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary },
  promoDesc: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  modalContent: { padding: SPACING.lg, gap: 0 },
  switchLabel: { fontSize: FONT_SIZE.base, color: COLORS.textPrimary, flex: 1 },
});
