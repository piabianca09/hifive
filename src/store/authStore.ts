import { create } from 'zustand';
import { UserRole } from '@/lib/types/database';

interface AuthState {
  user: { id: string; email: string } | null;
  userRole: UserRole | null;
  isLoading: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  setUserRole: (role: UserRole | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userRole: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setUserRole: (userRole) => set({ userRole }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
