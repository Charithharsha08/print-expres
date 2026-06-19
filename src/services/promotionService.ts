import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Promotion } from '../types';

export interface CreatePromotionPayload {
  title: string;
  description: string;
  discountPercent: number;
  validUntil: Date;
  active: boolean;
}

export const createPromotion = async (payload: CreatePromotionPayload): Promise<string> => {
  const ref = await addDoc(collection(db, 'promotions'), {
    ...payload,
    validUntil: Timestamp.fromDate(payload.validUntil),
  });
  return ref.id;
};

export const updatePromotion = async (
  promoId: string,
  payload: Partial<CreatePromotionPayload>
): Promise<void> => {
  const data: any = { ...payload };
  if (payload.validUntil) {
    data.validUntil = Timestamp.fromDate(payload.validUntil);
  }
  await updateDoc(doc(db, 'promotions', promoId), data);
};

export const deletePromotion = async (promoId: string): Promise<void> => {
  await deleteDoc(doc(db, 'promotions', promoId));
};

export const getPromotions = async (): Promise<Promotion[]> => {
  const q = query(collection(db, 'promotions'), orderBy('validUntil', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Promotion));
};

export const subscribeToPromotions = (
  callback: (promos: Promotion[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'promotions'), orderBy('validUntil', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Promotion)));
  });
};
