export const PAYMENT_CONFIG = {
  // Recommended shape for the native PayHere SDK (used by initiatePayHerePayment)
  MERCHANT_ID: "1236123",
  SANDBOX: true,

  // Legacy keys kept for backward compatibility (e.g. PayHereWebView fallback)
  PAYHERE_MERCHANT_ID: "1236123",
  // Store the decoded plain-text secret, NOT the Base64 version
  PAYHERE_MERCHANT_SECRET: "MjU0NTA4OTI2ODE5NjQyMzMxNDAxMjYwMTY5NzkzMzc0MDQ1NjAyMg==",
  PAYHERE_IS_SANDBOX: true,
  RETURN_URL: 'com.charith08.printxpress://payment/return',
  CANCEL_URL:  'com.charith08.printxpress://payment/cancel',
  NOTIFY_URL: "https://your-cloud-function-url.com/payhereNotify", // TODO: replace with real backend notify endpoint for production
};