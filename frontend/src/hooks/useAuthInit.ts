import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';

/**
 * 应用启动时恢复登录态：如果 localStorage 中有 token 但 store 中 user 为空，
 * 调用 GET /auth/me 从后端获取当前用户信息。
 */
export function useAuthInit() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const finishInitialization = useAuthStore((s) => s.finishInitialization);
  const initialized = useRef(false);

  useEffect(() => {
    // 只执行一次
    if (initialized.current) return;
    initialized.current = true;

    // 无 token：无需初始化，直接标记完成
    if (!token) {
      finishInitialization();
      return;
    }

    // 有 token 且已有 user（登录流程已设置）：无需再请求
    if (user) {
      finishInitialization();
      return;
    }

    // 有 token 但无 user（页面刷新）：调用后端恢复用户信息
    authApi
      .getMe()
      .then((u) => {
        setUser(u);
      })
      .catch(() => {
        // token 过期或无效：清除登录态
        useAuthStore.getState().logout();
      });
  }, [token, user, setUser, finishInitialization]);
}
