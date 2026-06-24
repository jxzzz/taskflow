import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/api/projects';
import { App } from 'antd';

/** 看板列表 */
export function useProjects(page = 1, size = 20) {
  return useQuery({
    queryKey: ['projects', page, size],
    queryFn: () => projectApi.list(page, size),
    placeholderData: (prev) => prev,
  });
}

/** 看板详情 */
export function useProject(id: number) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
  });
}

/** 创建看板 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: projectApi.create,
    onSuccess: (project) => {
      message.success(`看板「${project.name}」创建成功`);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '创建失败');
    },
  });
}

/** 更新看板 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string } }) =>
      projectApi.update(id, data),
    onSuccess: (project) => {
      message.success('看板已更新');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', project.id] });
    },
    onError: (error: Error) => {
      message.error(error.message || '更新失败');
    },
  });
}

/** 删除看板 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      message.success('看板已删除');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '删除失败');
    },
  });
}
