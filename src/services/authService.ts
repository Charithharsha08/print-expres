import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User,
  Unsubscribe,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export const registerUser = async ({
  fullName,
  email,
  password,
  phone,
}: RegisterPayload): Promise<User> => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(user, { displayName: fullName });

  const profile: Omit<UserProfile, 'createdAt'> & { createdAt: any } = {
    uid: user.uid,
    fullName,
    email,
    phone,
    role: 'customer',
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', user.uid), profile);

  return user;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};
