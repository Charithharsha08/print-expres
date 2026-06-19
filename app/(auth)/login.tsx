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
import { loginUser } from '../../src/services/authService';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await loginUser(email.trim().toLowerCase(), password);
      // RootLayout AuthGuard handles redirect automatically
    } catch (error: any) {
      const code: string = error?.code ?? '';
      const message =
        code === 'auth/user-not-found' || code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : code === 'auth/too-many-requests'
          ? 'Too many failed attempts. Try again later.'
          : code === 'auth/invalid-credential'
          ? 'Invalid email or password.'
          : 'Login failed. Please try again.';
      Alert.alert('Sign In Failed', message);
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
          {/* Brand header */}
          <Animated.View 
            entering={FadeInUp.duration(600).delay(100).springify()}
            style={styles.header}
          >
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>PX</Text>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your PrintXpress account</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(200).springify()}
            style={styles.formCard}
          >
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              isPassword
              error={errors.password}
            />

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Guest access */}
            <View style={styles.guestBox}>
              <Text style={styles.guestText}>
                Browse products without an account
              </Text>
              <Button
                title="Continue as Guest"
                variant="outline"
                size="md"
                onPress={() => router.replace('/(customer)')}
                style={{ marginTop: SPACING.sm }}
              />
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(350)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}> Sign Up</Text>
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
  title:    { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },

  forgotRow: { alignSelf: 'flex-end', marginBottom: SPACING.lg, marginTop: -SPACING.sm },
  forgotLink: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },

  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg, gap: SPACING.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 12, color: COLORS.textMuted },

  guestBox:  { backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.lg, padding: SPACING.md },
  guestText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },

  footer:     { flexDirection: 'row', justifyContent: 'center', paddingTop: SPACING.lg },
  footerText: { fontSize: 14, color: COLORS.textSecondary },
  footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});
