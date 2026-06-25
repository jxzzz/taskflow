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
  finishInitialization: () => void;
}

/**
 * 创建 store 时立即从 localStorage 恢复 token。
 *
 * user 对象无法从 localStorage 恢复（仅在登录时由后端返回），
 * 因此有 token 但无 user 时需要异步调用 GET /auth/me 补齐，
 * isInitialized 初始为 false 表示等待初始化完成。
 */
const storedToken = getToken();

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: null,
  isAuthenticated: !!storedToken,
  isInitialized: false,

  login: (token, user) => {
    setToken(token);
    set({ token, user, isAuthenticated: true, isInitialized: true });
  },

  logout: () => {
    removeToken();
    set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
  },

  setUser: (user) => {
    set({ user, isInitialized: true });
  },

  finishInitialization: () => {
    set({ isInitialized: true });
  },
}));
