import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/api/tasks';
import type { CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from '@/types/task';
import { App } from 'antd';

/** 卡片详情 */
export function useTaskDetail(id: number | null) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.getById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/** 创建卡片 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ listId, data }: { listId: number; data: CreateTaskRequest }) =>
      taskApi.create(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '创建失败');
    },
  });
}

/** 更新卡片 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskRequest }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '更新失败');
    },
  });
}

/** 删除卡片 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '删除失败');
    },
  });
}

/** 移动卡片 */
export function useMoveTask() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MoveTaskRequest }) => taskApi.move(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '移动失败');
    },
  });
}
