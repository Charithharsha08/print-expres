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
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';

export interface CreateProductPayload {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  available: boolean;
}

export const createProduct = async (payload: CreateProductPayload): Promise<string> => {
  const ref = await addDoc(collection(db, 'products'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProduct = async (
  productId: string,
  payload: Partial<CreateProductPayload>
): Promise<void> => {
  await updateDoc(doc(db, 'products', productId), payload);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  await deleteDoc(doc(db, 'products', productId));
};

export const getProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
};

export const subscribeToProducts = (
  callback: (products: Product[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
  });
};
