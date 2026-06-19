import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyChVeHJyj0V6ywpPv65DCKDm7ejjyyTfoQ",
  authDomain: "print-xpress-a88d8.firebaseapp.com",
  projectId: "print-xpress-a88d8",
  storageBucket: "print-xpress-a88d8.firebasestorage.app",
  messagingSenderId: "1013212340626",
  appId: "1:1013212340626:web:5dd046c1434b49331ee14b",
};

// Prevent duplicate initialization in Expo's fast-refresh / HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let firebaseAuth;

if (Platform.OS === 'web') {
  firebaseAuth = getAuth(app);
} else {
  // Dynamically require getReactNativePersistence from 'firebase/auth' to avoid Web/SSR compile crashes
  // @ts-ignore
  const { getReactNativePersistence } = require('firebase/auth');
  firebaseAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth = firebaseAuth;
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
