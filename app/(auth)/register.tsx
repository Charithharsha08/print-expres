import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { registerUser } from '../../src/services/authService';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim())           e.fullName = 'Full name is required';
    if (!form.email.trim())              e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim())              e.phone = 'Phone number is required';
    if (!form.password)                  e.password = 'Password is required';
    else if (form.password.length < 6)  e.password = 'Must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
      });
      // AuthGuard in _layout.tsx will redirect to /(customer) automatically
    } catch (error: any) {
      const code: string = error?.code ?? '';
      const message =
        code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : code === 'auth/invalid-email'
          ? 'The email address is not valid.'
          : code === 'auth/weak-password'
          ? 'Password is too weak. Use at least 6 characters.'
          : 'Registration failed. Please try again.';
      Alert.alert('Sign Up Failed', message);
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View 
            entering={FadeInUp.duration(600).delay(100).springify()}
            style={styles.header}
          >
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>PX</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join PrintXpress and order prints easily</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(200).springify()}
            style={styles.formCard}
          >
            <Input
              label="Full Name"
              value={form.fullName}
              onChangeText={set('fullName')}
              placeholder="e.g. Kasun Perera"
              autoCapitalize="words"
              autoComplete="name"
              error={errors.fullName}
            />
            <Input
              label="Email Address"
              value={form.email}
              onChangeText={set('email')}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChangeText={set('phone')}
              placeholder="+94 77 123 4567"
              keyboardType="phone-pad"
              autoComplete="tel"
              error={errors.phone}
            />
            <Input
              label="Password"
              value={form.password}
              onChangeText={set('password')}
              placeholder="Min. 6 characters"
              isPassword
              error={errors.password}
            />
            <Input
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={set('confirmPassword')}
              placeholder="Re-enter your password"
              isPassword
              error={errors.confirmPassword}
            />

            <Text style={styles.terms}>
              By registering you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={{ marginTop: SPACING.sm }}
            />
          </Animated.View>

          {/* Footer */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(350)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}> Sign In</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  kav:    { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },

  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.xl,
  },
  logoMark: {
    width: 58,
    height: 58,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    color: COLORS.textOnDark,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title:    { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },

  terms:     { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, marginTop: 4, marginBottom: SPACING.sm },
  termsLink: { color: COLORS.primary, fontWeight: '500' },

  footer:     { flexDirection: 'row', justifyContent: 'center', paddingTop: SPACING.lg },
  footerText: { fontSize: 14, color: COLORS.textSecondary },
  footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});
