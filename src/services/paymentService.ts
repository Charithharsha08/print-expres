import PayHere from '@payhere/payhere-mobilesdk-reactnative';
import { PAYMENT_CONFIG } from '../constants/paymentConfig';
import { updateOrderPaymentStatus } from './orderService';

export interface PayHerePaymentInput {
  orderId: string;
  amount: number;
  items: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country?: string;
  custom1?: string;
  custom2?: string;
}

export interface PayHerePaymentResult {
  success: boolean;
  status: 'completed' | 'failed' | 'cancelled';
  paymentId?: string;
  orderId: string;
  amount: number;
  error?: string;
}

/**
 * Initiates a PayHere payment using the native SDK.
 * IMPORTANT: This requires a custom dev client build (expo-dev-client + EAS or `expo run:android`).
 * It will NOT work inside Expo Go (you will get "Native module cannot be null").
 *
 * The paymentObject and callbacks follow the official @payhere/payhere-mobilesdk-reactnative guide.
 */
export const initiatePayHerePayment = (
  paymentInput: PayHerePaymentInput
): Promise<PayHerePaymentResult> => {
  return new Promise((resolve) => {
    // Prepare PayHere payment object (per the integration guide)
    const paymentObject = {
      sandbox: PAYMENT_CONFIG.SANDBOX ?? PAYMENT_CONFIG.PAYHERE_IS_SANDBOX ?? true,
      merchant_id: PAYMENT_CONFIG.MERCHANT_ID ?? PAYMENT_CONFIG.PAYHERE_MERCHANT_ID,
      notify_url: PAYMENT_CONFIG.NOTIFY_URL || "",
      order_id: paymentInput.orderId,
      items: paymentInput.items,
      amount: paymentInput.amount,
      currency: "LKR",
      first_name: paymentInput.firstName,
      last_name: paymentInput.lastName,
      email: paymentInput.email,
      phone: paymentInput.phone,
      address: paymentInput.address,
      city: paymentInput.city,
      country: paymentInput.country || "Sri Lanka",
      custom_1: paymentInput.custom1,
      custom_2: paymentInput.custom2,
    };

    PayHere.startPayment(
      paymentObject,
      async (paymentId: string) => {
        // ✅ Payment Success
        console.log('✅ Payment successful:', paymentId);

        // Update payment/order status in Firestore
        try {
          await updateOrderPaymentStatus(paymentInput.orderId, 'paid', 'processing');

          resolve({
            success: true,
            status: 'completed',
            paymentId: paymentId,
            orderId: paymentInput.orderId,
            amount: paymentInput.amount,
          });
        } catch (error: any) {
          console.error('Error updating payment record:', error);
          resolve({
            success: true,
            status: 'completed',
            paymentId: paymentId,
            orderId: paymentInput.orderId,
            amount: paymentInput.amount,
            error: 'Payment successful but record update failed',
          });
        }
      },
      async (errorData: string) => {
        // ❌ Payment Error
        console.log('❌ Payment failed:', errorData);

        // Update payment status in Firestore
        try {
          await updateOrderPaymentStatus(paymentInput.orderId, 'failed');
        } catch (error) {
          console.error('Error updating failed payment:', error);
        }

        resolve({
          success: false,
          status: 'failed',
          orderId: paymentInput.orderId,
          amount: paymentInput.amount,
          error: errorData,
        });
      },
      async () => {
        // ⚠️ Payment Dismissed/Cancelled
        console.log('⚠️ Payment cancelled by user');

        try {
          await updateOrderPaymentStatus(paymentInput.orderId, 'failed');
        } catch (error) {
          console.error('Error updating cancelled payment:', error);
        }

        resolve({
          success: false,
          status: 'cancelled',
          orderId: paymentInput.orderId,
          amount: paymentInput.amount,
          error: 'Payment was cancelled by user',
        });
      }
    );
  });
};
