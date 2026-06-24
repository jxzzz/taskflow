import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistApi } from '@/api/tasks';
import { App } from 'antd';

/** 添加检查项（乐观更新 projects + task detail 缓存） */
export function useCreateChecklistItem(taskId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (title: string) => checklistApi.create(taskId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
    onError: (error: Error) => {
      message.error(error.message || '添加失败');
    },
  });
}

/** 切换检查项完成状态 */
export function useToggleChecklistItem(taskId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: number) => checklistApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
    onError: (error: Error) => {
      message.error(error.message || '操作失败');
    },
  });
}

/** 删除检查项 */
export function useDeleteChecklistItem(taskId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: number) => checklistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
    onError: (error: Error) => {
      message.error(error.message || '删除失败');
    },
  });
}
