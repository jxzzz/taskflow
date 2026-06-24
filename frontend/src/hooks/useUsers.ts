import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/users';
import { App } from 'antd';
import { useAuthStore } from '@/stores/authStore';

/** 分页用户列表 */
export function useUsers(page: number, size: number) {
  return useQuery({
    queryKey: ['users', page, size],
    queryFn: () => userApi.list(page, size),
    placeholderData: (prev) => prev,
  });
}

/** 单个用户详情 */
export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
}

/** 删除用户 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const currentUser = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: (_data, id) => {
      message.success('用户已删除');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // 如果删的是自己，退出登录
      if (currentUser?.id === id) {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      }
    },
    onError: (error: Error) => {
      message.error(error.message || '删除失败');
    },
  });
}

/** 更新用户信息 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { username?: string; password?: string; avatar?: string } }) =>
      userApi.update(id, data),
    onSuccess: (updated, { id }) => {
      message.success('用户信息已更新');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // 如果更新的是自己，同步更新 authStore
      if (currentUser?.id === id) {
        setUser(updated);
      }
    },
    onError: (error: Error) => {
      message.error(error.message || '更新失败');
    },
  });
}
