import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';

export default function SupportScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing fields', 'Please fill in subject and message.'); return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    Alert.alert('Sent! ✅', 'Your message has been received. We\'ll get back to you shortly.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Contact Support</Text>
        <View style={{ width: 24 }} />
      </Animated.View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500).delay(80).springify()} style={styles.contactOptions}>
          {[
            { icon: 'call-outline', label: 'Call Us', sub: '+94 77 123 4567', bg: '#EEF2FF', iconColor: '#4F46E5' },
            { icon: 'mail-outline', label: 'Email', sub: 'support@px.lk', bg: '#ECFDF5', iconColor: '#10B981' },
            { icon: 'time-outline', label: 'Hours', sub: 'Mon–Sat, 8am–6pm', bg: '#FFF7ED', iconColor: '#F97316' },
          ].map((c, i) => (
            <Animated.View 
              key={c.label}
              entering={FadeInDown.duration(450).delay(100 + i * 50)}
              style={styles.contactCard}
            >
              <View style={[styles.contactIconWrap, { backgroundColor: c.bg }]}>
                <Ionicons name={c.icon as any} size={20} color={c.iconColor} />
              </View>
              <Text style={styles.contactLabel}>{c.label}</Text>
              <Text style={styles.contactSub}>{c.sub}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(250).springify()} style={styles.formCard}>
          <Text style={styles.formTitle}>Send a Message</Text>
          <Input label="Subject" value={subject} onChangeText={setSubject} placeholder="What's this about?" autoCapitalize="sentences" />
          <Input label="Message" value={message} onChangeText={setMessage} placeholder="Describe your issue or question..." multiline numberOfLines={5} autoCapitalize="sentences" />
          <Button title="Send Message" onPress={handleSend} loading={sending} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, ...SHADOWS.sm },
  topTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  content: { padding: SPACING.lg, gap: SPACING.md },
  contactOptions: { flexDirection: 'row', gap: 8, marginBottom: SPACING.sm },
  contactCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  contactIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  contactLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textPrimary },
  contactSub: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center', fontWeight: '500' },
  formCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  formTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
});
