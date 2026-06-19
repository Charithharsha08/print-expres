import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

const GUIDELINES = [
  { icon: 'image-outline', title: 'File Formats', desc: 'Submit designs as PDF, PNG, or JPG. PDF is preferred for print-ready files with exact colors.' },
  { icon: 'color-palette-outline', title: 'Color Mode', desc: 'Use CMYK color mode for best print accuracy. RGB designs will be converted and may vary slightly.' },
  { icon: 'resize-outline', title: 'Resolution', desc: 'Minimum 300 DPI for sharp print quality. Low-res images may appear blurry in the final print.' },
  { icon: 'text-outline', title: 'Fonts & Text', desc: 'Embed or outline all fonts in your design to avoid font substitution issues.' },
  { icon: 'cut-outline', title: 'Bleed & Margins', desc: 'Add 3mm bleed on all sides. Keep important content 5mm from edges to avoid trimming.' },
  { icon: 'time-outline', title: 'Turnaround Time', desc: 'Standard orders: 2–3 business days. Express orders (extra fee): next business day.' },
  { icon: 'card-outline', title: 'Payment', desc: 'Payment is collected at pickup or upon delivery confirmation. We accept cash and card.' },
  { icon: 'refresh-outline', title: 'Revisions', desc: 'Design issues from our end are reprinted free. Customer file errors may incur reprint fees.' },
];

export default function GuidelinesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Print Guidelines</Text>
        <View style={{ width: 24 }} />
      </Animated.View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500).delay(80).springify()} style={styles.heroBanner}>
          <Ionicons name="information-circle-outline" size={28} color="#fff" />
          <Text style={styles.heroText}>Please read these guidelines before placing your order to ensure the best print quality.</Text>
        </Animated.View>
        {GUIDELINES.map((g, i) => (
          <Animated.View 
            key={i} 
            entering={FadeInDown.duration(450).delay(120 + i * 50)}
            style={styles.card}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={g.icon as any} size={20} color={COLORS.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{g.title}</Text>
              <Text style={styles.cardDesc}>{g.desc}</Text>
            </View>
          </Animated.View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, ...SHADOWS.sm },
  topTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  content: { padding: SPACING.lg, gap: 12 },
  heroBanner: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.lg, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 4, ...SHADOWS.sm },
  heroText: { flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: FONT_SIZE.sm, lineHeight: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', gap: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  cardIcon: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: '#FFF1F0', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20 },
});
