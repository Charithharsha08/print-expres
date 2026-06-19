import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { resetPassword } from '../../src/services/authService';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError('');
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Could not send reset email. Please check the email address and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back to Sign In</Text>
          </TouchableOpacity>

          {sent ? (
            <Animated.View 
              entering={ZoomIn.duration(600).springify()}
              style={styles.successContainer}
            >
              <View style={styles.successIconBox}>
                <Text style={styles.successEmoji}>📧</Text>
              </View>
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successBody}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailBold}>{email}</Text>
                {'\n\n'}Check your spam folder if you don't see it within a few minutes.
              </Text>
              <Button
                title="Back to Sign In"
                onPress={() => router.replace('/(auth)/login')}
                style={{ marginTop: SPACING.lg }}
              />
              <Button
                title="Resend Email"
                variant="ghost"
                onPress={() => { setSent(false); }}
                style={{ marginTop: SPACING.sm }}
              />
            </Animated.View>
          ) : (
            <Animated.View 
              entering={FadeInDown.duration(600).delay(150).springify()}
              style={styles.formCard}
            >
              <View style={styles.iconBox}>
                <Text style={styles.iconEmoji}>🔑</Text>
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your registered email and we'll send you a link to reset your password.
              </Text>

              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoComplete="email"
                error={emailError}
                containerStyle={{ marginTop: SPACING.lg }}
              />

              <Button
                title="Send Reset Link"
                onPress={handleSend}
                loading={loading}
                size="lg"
                style={{ marginTop: SPACING.sm }}
              />
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.background },
  kav:       { flex: 1 },
  container: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, justifyContent: 'center' },

  back:     { position: 'absolute', top: SPACING.md, left: SPACING.lg, zIndex: 10 },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  iconEmoji: { fontSize: 24 },

  title:    { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3, marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },

  successContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
    alignItems: 'center',
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  successEmoji: { fontSize: 40 },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  successBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailBold: { fontWeight: '600', color: COLORS.textPrimary },
});
