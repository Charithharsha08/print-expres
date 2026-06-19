import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import {
  subscribeToAuthChanges,
  getUserProfile,
  logoutUser,
} from '../services/authService';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;

  // Computed helpers
  isAdmin: () => boolean;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  logout: async () => {
    await logoutUser();
    set({ user: null, profile: null });
  },

  isAdmin: () => get().profile?.role === 'admin',
  isLoggedIn: () => get().user !== null,
}));

// Call this once at app startup (in _layout.tsx)
export const initAuthListener = (): (() => void) => {
  return subscribeToAuthChanges(async (firebaseUser) => {
    if (firebaseUser) {
      useAuthStore.setState({ user: firebaseUser, loading: true });
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        useAuthStore.setState({ profile, loading: false, initialized: true });
      } catch {
        useAuthStore.setState({ profile: null, loading: false, initialized: true });
      }
    } else {
      useAuthStore.setState({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
    }
  });
};
