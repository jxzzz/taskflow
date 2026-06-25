import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '@/api/members';
import type { AddMemberRequest, UpdateMemberRoleRequest } from '@/types/member';
import { App } from 'antd';

/** 项目成员列表 */
export function useProjectMembers(projectId: number) {
  return useQuery({
    queryKey: ['members', projectId],
    queryFn: () => memberApi.list(projectId),
    enabled: !!projectId,
  });
}

/** 添加成员 */
export function useAddMember(projectId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (data: AddMemberRequest) => memberApi.add(projectId, data),
    onSuccess: () => {
      message.success('添加成功');
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
    onError: (error: Error) => {
      message.error(error.message || '添加失败');
    },
  });
}

/** 更新成员角色 */
export function useUpdateMemberRole(projectId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateMemberRoleRequest }) =>
      memberApi.updateRole(projectId, userId, data),
    onSuccess: () => {
      message.success('角色已更新');
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
    onError: (error: Error) => {
      message.error(error.message || '更新失败');
    },
  });
}

/** 移除成员 */
export function useRemoveMember(projectId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (userId: number) => memberApi.remove(projectId, userId),
    onSuccess: () => {
      message.success('已移除');
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
    onError: (error: Error) => {
      message.error(error.message || '移除失败');
    },
  });
}
