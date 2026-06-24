import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/api/projects';
import { App } from 'antd';
import type { UpdateProjectRequest } from '@/types/project';

/** 项目列表（支持 filter: 'my' | 'public' | undefined） */
export function useProjects(page = 1, size = 20, filter?: string) {
  return useQuery({
    queryKey: ['projects', page, size, filter],
    queryFn: () => projectApi.list(page, size, filter),
    placeholderData: (prev) => prev,
  });
}

/** 项目详情 */
export function useProject(id: number) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
  });
}

/** 创建项目 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: projectApi.create,
    onSuccess: (project) => {
      message.success(`项目「${project.name}」创建成功`);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '创建失败');
    },
  });
}

/** 更新项目 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectRequest }) =>
      projectApi.update(id, data),
    onSuccess: (project) => {
      message.success('项目已更新');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', project.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '更新失败');
    },
  });
}

/** 删除项目 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      message.success('项目已删除');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '删除失败');
    },
  });
}
