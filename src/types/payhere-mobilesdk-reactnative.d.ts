// types/payhere-mobilesdk-reactnative.d.ts
// Type definitions for @payhere/payhere-mobilesdk-reactnative
// Following the official integration guide for Expo + native dev client builds.

declare module '@payhere/payhere-mobilesdk-reactnative' {
  export interface PayHerePaymentObject {
    sandbox: boolean;
    merchant_id: string;
    notify_url?: string;
    order_id: string;
    items: string;
    amount: number | string;
    currency: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    delivery_address?: string;
    delivery_city?: string;
    delivery_country?: string;
    custom_1?: string;
    custom_2?: string;
  }

  export interface PayHere {
    startPayment(
      paymentObject: PayHerePaymentObject,
      onSuccess: (paymentId: string) => void,
      onError: (errorData: string) => void,
      onDismiss: () => void
    ): void;
  }

  const PayHere: PayHere;
  export default PayHere;
}
