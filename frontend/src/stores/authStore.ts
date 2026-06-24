import { create } from 'zustand';
import type { UserInfo } from '@/types/auth';
import { getToken, setToken, removeToken } from '@/utils/token';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  setUser: (user: UserInfo) => void;
}

/** 创建 store 时立即从 localStorage 恢复 token */
const storedToken = getToken();

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: null,
  isAuthenticated: !!storedToken,
  isInitialized: true, // token 恢复是同步的，立即可用

  login: (token, user) => {
    setToken(token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    removeToken();
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user });
  },
}));
