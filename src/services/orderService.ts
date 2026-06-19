import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, OrderStatus, PrintSpec } from '../types';

export interface CreateOrderPayload {
  userId: string;
  productId: string;
  productName: string;
  designFileUrl?: string;
  printSpec: PrintSpec;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  totalPrice: number;
  notes?: string;
  paymentMethod: 'payhere' | 'cod' | 'pay_at_store';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cash_on_delivery';
}

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<string> => {
  const cleanedPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => value !== undefined),
  );

  const ref = await addDoc(collection(db, "orders"), {
    ...cleanedPayload,
    status: "pending" as OrderStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
};

export const updateOrderPaymentStatus = async (
  orderId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cash_on_delivery',
  status?: OrderStatus
): Promise<void> => {
  const updates: any = {
    paymentStatus,
    updatedAt: serverTimestamp(),
  };
  if (status) {
    updates.status = status;
  }
  await updateDoc(doc(db, 'orders', orderId), updates);
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
};

export const getAllOrders = async (): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<void> => {
  await updateDoc(doc(db, 'orders', orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
  });
};

export const subscribeToAllOrders = (
  callback: (orders: Order[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
  });
};
