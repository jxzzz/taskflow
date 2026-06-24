import { create } from 'zustand';
import type { UserInfo } from '@/types/auth';
import { getToken, setToken, removeToken } from '@/utils/token';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;

  /** 登录成功：保存 token 和用户信息 */
  login: (token: string, user: UserInfo) => void;

  /** 退出登录：清除所有认证状态 */
  logout: () => void;

  /** 更新用户信息（如修改用户名后） */
  setUser: (user: UserInfo) => void;

  /** 从 localStorage 恢复会话（应用初始化时调用） */
  restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

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

  restoreSession: () => {
    const token = getToken();
    if (token) {
      set({ token, isAuthenticated: true });
      // user 信息从 API 获取（由调用方在应用启动时 fetch 后 setUser）
    }
  },
}));
