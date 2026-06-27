# 🖨️ Print Xpress Mobile App

**Print Xpress** is a modern, high-performance universal mobile application built with **React Native**, **Expo (v54)**, and **TypeScript**. It offers a seamless platform for customers to order print jobs and select printing options (paper size, binding, color options), and for administrators to manage products, promotions, and process orders.

---

## 🚀 Key Features

### 👤 Customer App
*   **Quick & Flexible Ordering:** Place printing orders by uploading PDF documents or image files.
*   **Custom Print Specs:** Configure specifications including:
    *   **Paper Sizes:** A4, A3, A5, Letter, Legal.
    *   **Color Preference:** Full color or grayscale.
    *   **Double-sided Printing:** Support for single-sided or duplex print jobs.
    *   **Binding Options:** None, spiral, or staples.
*   **Real-time Cost Estimator:** Live calculation of printing fees based on custom configurations and selected products.
*   **Multiple Payment Options:** Seamless payment using **PayHere Native SDK** (mobile card processing), Pay at Store, or Cash on Delivery (COD).
*   **Order Tracking:** Track printing phases from *Pending*, *Processing*, *Ready*, *Out for Delivery*, to *Delivered*.
*   **Promotions & Offers:** Apply active coupon codes and view hot deals directly from the home screen dashboard.
*   **Support & Help Desk:** Instant access to print guidelines and customer support.

### 🛡️ Admin Dashboard
*   **Order Management Console:** Monitor pending print requests, update processing stages, track payments, and review customer files.
*   **Inventory & Products:** Dynamically create, edit, or delete print products and toggle their availability status.
*   **Promotional Campaign Management:** Configure discounts, set start/end conditions, and publish active offers.
*   **Business Insights:** Dashboard displaying order volume statistics, active promotions, and earnings.

---

## 🛠️ Technology Stack
*   **Framework:** [Expo v54](https://expo.dev/) (React Native) with Expo Router for file-based routing.
*   **Language:** [TypeScript](https://www.typescriptlang.org/) for robust types.
*   **Styling:** [NativeWind v4](https://www.nativewind.dev/) (TailwindCSS integration for React Native) & Custom Theme variables.
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) for fast, lightweight global state.
*   **Database & Auth:** [Firebase v12](https://firebase.google.com/) (Firestore, Storage, Authentication).
*   **Media Hosting:** [Cloudinary](https://cloudinary.com/) (Unsigned upload preset for file assets).
*   **Payment Gateway:** [PayHere SDK](https://www.payhere.lk/) (with local WebView fallback for robust checkout).
*   **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for butter-smooth visual transitions.

---

## 📂 Project Architecture

```text
├── app/                      # Expo Router File-Based Routing
│   ├── _layout.tsx           # Global App Entry & Providers
│   ├── (auth)/               # Authentication Routes (Login, Register, Forgot Password)
│   ├── (customer)/           # Customer Screens (Home, Place Order, Track, Profile, Support)
│   └── (admin)/              # Administrative Dashboards & Management Screens
├── assets/                   # App Icons, Splash Screens, & Static Images
├── src/
│   ├── components/           # Reusable UI & Logic Components
│   │   ├── common/           # Custom Buttons, Text Inputs, and WebView fallbacks
│   │   └── forms/            # Form-specific wrappers
│   ├── constants/            # Global Constants (COLORS, SPACING, Theme, Payment configuration)
│   ├── hooks/                # Custom React hooks
│   ├── services/             # Firebase SDK, Cloudinary, PayHere, & database APIs
│   │   ├── authService.ts
│   │   ├── cloudinaryService.ts
│   │   ├── firebase.ts
│   │   ├── orderService.ts
│   │   ├── paymentService.ts
│   │   ├── productService.ts
│   │   └── promotionService.ts
│   ├── store/                # Zustand State Stores (authStore, etc.)
│   ├── types/                # TypeScript Interface definitions
│   └── utils/                # General utility helper functions
├── tailwind.config.js        # TailwindCSS Configuration
└── tsconfig.json             # TypeScript Compiler Options
```

---

## ⚙️ Setup & Configuration

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Git](https://git-scm.com/)
*   Expo Go app on your physical device, or Xcode / Android Studio simulator

### 2. Clone the Project
```bash
git clone <repository-url>
cd print-xpress
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment and Services Configuration

#### **Firebase Setup**
Create a web app in your Firebase Console and update the credentials in `src/services/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

#### **Cloudinary Setup**
Configure your Cloudinary unsigned upload credentials in `src/services/cloudinaryService.ts`:
```typescript
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUDINARY_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "YOUR_UNSIGNED_UPLOAD_PRESET";
```

#### **PayHere Integration**
Update merchant credentials and sandbox settings in `src/constants/paymentConfig.ts`:
```typescript
export const PAYMENT_CONFIG = {
  MERCHANT_ID: "YOUR_MERCHANT_ID",
  SANDBOX: true, // Set to false in production
  PAYHERE_MERCHANT_SECRET: "YOUR_DECODED_PLAIN_TEXT_SECRET",
  RETURN_URL: 'com.charith08.printxpress://payment/return',
  CANCEL_URL: 'com.charith08.printxpress://payment/cancel',
  NOTIFY_URL: "https://your-cloud-function-url.com/payhereNotify",
};
```

---

## 🚀 Running the Project

### Running in Development (Expo Go / Web)
Start the Expo development server:
```bash
npm run start
```
*   Scan the QR code in the terminal with your phone using the **Expo Go** app to test on a physical device.
*   Press `a` to open in an Android Emulator.
*   Press `i` to open in an iOS Simulator.
*   Press `w` to open in a web browser.

### Native Builds & Dev Clients (Required for PayHere Native SDK)
Since this project integrates native mobile libraries like `@payhere/payhere-mobilesdk-reactnative`, running on physical devices or simulators with native capabilities requires building a development client:

*   **iOS Development Build:**
    ```bash
    npm run ios
    ```
*   **Android Development Build:**
    ```bash
    npm run android
    ```
*   **Production Release (EAS Build):**
    Ensure you have `eas-cli` installed and run:
    ```bash
    eas build --profile production --platform all
    ```
