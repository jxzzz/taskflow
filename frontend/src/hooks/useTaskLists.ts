import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskListApi } from '@/api/tasks';
import { App } from 'antd';

/** 创建列表 */
export function useCreateTaskList(projectId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (name: string) => taskListApi.create(projectId, { name }),
    onSuccess: () => {
      message.success('列表已创建');
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
    onError: (error: Error) => {
      message.error(error.message || '创建失败');
    },
  });
}

/** 更新列表 */
export function useUpdateTaskList(projectId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      taskListApi.update(projectId, id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
    onError: (error: Error) => {
      message.error(error.message || '更新失败');
    },
  });
}

/** 删除列表 */
export function useDeleteTaskList(projectId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: number) => taskListApi.delete(projectId, id),
    onSuccess: () => {
      message.success('列表已删除');
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
    onError: (error: Error) => {
      message.error(error.message || '删除失败');
    },
  });
}
