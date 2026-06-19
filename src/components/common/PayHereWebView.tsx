import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import { PAYMENT_CONFIG } from '../../constants/paymentConfig';
import * as Crypto from 'expo-crypto';

interface PayHereWebViewProps {
  visible: boolean;
  orderId: string;
  amount: number;
  items: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  onSuccess: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onClose: () => void;
}

export default function PayHereWebView({
  visible,
  orderId,
  amount,
  items,
  customerName,
  email,
  phone,
  address,
  city,
  onSuccess,
  onCancel,
  onClose,
}: PayHereWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [hash, setHash] = useState<string | null>(null);
  const [hashError, setHashError] = useState<string | null>(null);

  // Synchronous "I have already started work for this payment open" flag.
  // We set this IMMEDIATELY (before any await or setState) so that React StrictMode's
  // double-invocation of effects during development cannot start a second hash generation.
  const hasInitiatedRef = useRef(false);

  // Format inputs (stable across renders)
  const amountFormatted = parseFloat(amount.toString()).toFixed(2);
  const nameParts = customerName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || 'User';
  const cleanedPhone = phone.replace(/[^0-9+]/g, '') || '+94771234567';
  const cleanedAddress = address.trim() || 'No. 20, Main Street';
  const cleanedCity = city.trim() || 'Colombo';

  // Helper to escape HTML attributes to prevent quotes from breaking hidden input fields
  const escapeHtmlAttr = (str: string) => {
    if (!str) return '';
    return str.toString().replace(/"/g, '&quot;');
  };

  // Generate MD5 hash for PayHere security (must be done server-side in production,
  // but for client we compute here using the secret from config - OK for dev/sandbox only)
  // Formula: UPPER( MD5( merchant_id + order_id + amount(2dp) + currency + UPPER(MD5(secret)) ) )
  useEffect(() => {
    if (!visible) {
      // Modal is closed/hidden — fully reset for the next time it opens.
      setHash(null);
      setHashError(null);
      hasInitiatedRef.current = false;
      return;
    }

    // If we have already claimed this payment open (even under StrictMode double-invoke),
    // bail out synchronously. This is the key fix.
    if (hasInitiatedRef.current) {
      return;
    }

    // Claim the slot RIGHT NOW, before any async work.
    // Any second effect run (StrictMode, re-render, etc.) will see this and exit above.
    hasInitiatedRef.current = true;

    let cancelled = false;

    const generateHash = async () => {
      try {
        setHashError(null);

        const secretHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.MD5,
          PAYMENT_CONFIG.PAYHERE_MERCHANT_SECRET
        ).then((h) => h.toUpperCase());

        const rawString =
          PAYMENT_CONFIG.PAYHERE_MERCHANT_ID +
          orderId +
          amountFormatted +
          'LKR' +
          secretHash;

        const finalHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.MD5,
          rawString
        ).then((h) => h.toUpperCase());

        if (!cancelled) {
          // This block now runs only for the one claimed initiation.
          console.log('=== PayHere Hash Generated (once per open) ===');
          console.log('merchant_id:', PAYMENT_CONFIG.PAYHERE_MERCHANT_ID);
          console.log('order_id:', orderId);
          console.log('amount:', amountFormatted);
          console.log('currency:', 'LKR');
          console.log('secret_hash:', secretHash);
          console.log('raw_string:', rawString);
          console.log('final_hash:', finalHash);
          console.log('is_sandbox:', PAYMENT_CONFIG.PAYHERE_IS_SANDBOX);
          console.log('notify_url:', PAYMENT_CONFIG.NOTIFY_URL);

          setHash(finalHash);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('PayHere hash generation failed:', e);
          setHashError(e?.message || 'Failed to prepare payment security hash');
        }
      }
    };

    generateHash();

    return () => {
      cancelled = true;
    };
  }, [visible, orderId, amountFormatted]);

  // When we get a fresh hash, the WebView will load new HTML — show its loading state
  useEffect(() => {
    if (hash) {
      setLoading(true);
    }
  }, [hash]);

  const payHereUrl = PAYMENT_CONFIG.PAYHERE_IS_SANDBOX
    ? 'https://sandbox.payhere.lk/pay/checkout'
    : 'https://www.payhere.lk/pay/checkout';

  // Build the auto-submitting form HTML only when hash is ready
  // While waiting for hash, show a minimal loader page so WebView has valid content
  const htmlContent = hash
    ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f7f7f9;
          }
          .loader {
            border: 4px solid #e2e2ea;
            border-top: 4px solid #1A1A2E;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .text {
            color: #5C5C72;
            font-size: 15px;
            font-weight: 600;
            text-align: center;
            padding: 0 20px;
          }
        </style>
      </head>
      <body onload="document.getElementById('payhere_form').submit()">
        <div class="loader"></div>
        <div class="text">Connecting to Secure PayHere Gateway...</div>
        <form id="payhere_form" name="payhere_form" action="${payHereUrl}" method="POST">
          <input type="hidden" name="merchant_id" value="${escapeHtmlAttr(PAYMENT_CONFIG.PAYHERE_MERCHANT_ID)}" />
          <input type="hidden" name="return_url" value="${escapeHtmlAttr(PAYMENT_CONFIG.RETURN_URL)}" />
          <input type="hidden" name="cancel_url" value="${escapeHtmlAttr(PAYMENT_CONFIG.CANCEL_URL)}" />
          <input type="hidden" name="notify_url" value="${escapeHtmlAttr(PAYMENT_CONFIG.NOTIFY_URL)}" />
          <input type="hidden" name="order_id" value="${escapeHtmlAttr(orderId)}" />
          <input type="hidden" name="items" value="${escapeHtmlAttr(items)}" />
          <input type="hidden" name="currency" value="LKR" />
          <input type="hidden" name="amount" value="${escapeHtmlAttr(amountFormatted)}" />
          <input type="hidden" name="first_name" value="${escapeHtmlAttr(firstName)}" />
          <input type="hidden" name="last_name" value="${escapeHtmlAttr(lastName)}" />
          <input type="hidden" name="email" value="${escapeHtmlAttr(email)}" />
          <input type="hidden" name="phone" value="${escapeHtmlAttr(cleanedPhone)}" />
          <input type="hidden" name="address" value="${escapeHtmlAttr(cleanedAddress)}" />
          <input type="hidden" name="city" value="${escapeHtmlAttr(cleanedCity)}" />
          <input type="hidden" name="country" value="Sri Lanka" />
          <input type="hidden" name="hash" value="${escapeHtmlAttr(hash)}" />
        </form>
      </body>
    </html>
  `
    : `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f7f7f9;
          }
          .text {
            color: #5C5C72;
            font-size: 15px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="text">Preparing secure payment...</div>
      </body>
    </html>
  `;

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    // Handle deep link URLs
    if (url.includes('payment/return') || url.includes('payhere_return')) {
      onSuccess(orderId);
      return;
    }
    if (url.includes('payment/cancel') || url.includes('payhere_cancel')) {
      onCancel(orderId);
      return;
    }
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;

    // Intercept custom URL schemes to prevent WebView from trying to load them
    // and showing an "unknown scheme" error page
    if (
      url.startsWith('com.charith08.printxpress://') ||
      url.startsWith('printxpress://') ||
      (!url.startsWith('http://') && !url.startsWith('https://'))
    ) {
      if (url.includes('payment/return') || url.includes('payhere_return')) {
        onSuccess(orderId);
      } else if (url.includes('payment/cancel') || url.includes('payhere_cancel')) {
        onCancel(orderId);
      }
      return false; // Stop the WebView from trying to load this scheme
    }
    return true;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Secure Payment</Text>
          <View style={styles.rightPlaceholder} />
        </View>

        {/* WebView */}
        <View style={styles.webviewWrapper}>
          <WebView
            source={{ html: htmlContent }}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            originWhitelist={['*']}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loaderText}>Loading Checkout page...</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rightPlaceholder: {
    width: 32,
  },
  webviewWrapper: {
    flex: 1,
    position: 'relative',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
