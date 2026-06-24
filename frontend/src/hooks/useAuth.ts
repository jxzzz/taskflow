import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, RegisterRequest } from '@/types/auth';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';

/** 登录 mutation，成功后自动保存 token 并跳转 */
export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const { message } = App.useApp();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      login(res.token, res.user);
      message.success(`欢迎回来，${res.user.username}`);
      // 跳转到 returnUrl 或默认控制台
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl') || '/dashboard';
      navigate(returnUrl, { replace: true });
    },
    onError: (error: Error) => {
      message.error(error.message || '登录失败，请检查用户名和密码');
    },
  });
}

/** 注册 mutation，成功后跳转登录页 */
export function useRegister() {
  const { message } = App.useApp();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      message.success('注册成功，请登录');
      navigate('/auth/login');
    },
    onError: (error: Error) => {
      message.error(error.message || '注册失败，请稍后重试');
    },
  });
}
