import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, taskListApi } from '@/api/tasks';
import type { ReorderItem } from '@/types/task';
import type { Project } from '@/types/project';

/** 计算排序数组：将 oldIndex 移动到 newIndex，重新分配 sortOrder */
export function computeSortOrders<T extends { id: number }>(
  items: T[],
  oldIndex: number,
  newIndex: number,
): ReorderItem[] {
  const reordered = [...items];
  const [removed] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, removed);
  return reordered.map((item, index) => ({
    id: item.id,
    sortOrder: index * 1000,
  }));
}

/** 根据 ReorderItem[] 重排数组 */
export function reorderByItems<T extends { id: number; sortOrder: number }>(
  items: T[],
  reorderItems: ReorderItem[],
): T[] {
  const orderMap = new Map(reorderItems.map((r) => [r.id, r.sortOrder]));
  return [...items]
    .map((item) => ({ ...item, sortOrder: orderMap.get(item.id) ?? item.sortOrder }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 卡片列内排序 — 带乐观更新 */
export function useReorderTasks(listId: number, projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: ReorderItem[]) => taskApi.reorder(projectId, listId, items),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: ['projects', projectId] });
      const previous = queryClient.getQueryData<Project>(['projects', projectId]);

      queryClient.setQueryData<Project>(['projects', projectId], (old) => {
        if (!old) return old;

        return {
          ...old,
          lists: old.lists?.map((l) =>
            l.id === listId ? { ...l, tasks: reorderByItems(l.tasks, items) } : l,
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['projects', projectId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

/** 列表列间排序 — 带乐观更新 */
export function useReorderLists(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: ReorderItem[]) => taskListApi.reorder(projectId, items),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: ['projects', projectId] });
      const previous = queryClient.getQueryData<Project>(['projects', projectId]);

      queryClient.setQueryData<Project>(['projects', projectId], (old) => {
        if (!old) return old;
        return {
          ...old,
          lists: reorderByItems(old.lists ?? [], items),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['projects', projectId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}
