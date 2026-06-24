import { useState, useRef, useCallback, useEffect } from 'react';
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useMoveTask } from '@/hooks/useTasks';
import { computeSortOrders } from '@/hooks/useKanbanMutations';
import { taskApi, taskListApi } from '@/api/tasks';
import type { TaskCardBrief, TaskListSummary } from '@/types/task';
import type { Project } from '@/types/project';

interface UseKanbanDragParams {
  projectId: number;
  lists: TaskListSummary[];
  onDragStartClosesDrawer: () => void;
}

export function useKanbanDrag({ projectId, lists, onDragStartClosesDrawer }: UseKanbanDragParams) {
  const queryClient = useQueryClient();
  const moveTask = useMoveTask();
  const [activeTask, setActiveTask] = useState<TaskCardBrief | null>(null);
  const previousCacheRef = useRef<Project | undefined>(undefined);
  const sourceListIdRef = useRef<number | null>(null);
  const optimisticListIdRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return closestCenter(args);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          transition: 'transform 250ms cubic-bezier(0.19, 1, 0.22, 1), opacity 200ms ease',
        },
      },
    }),
  };

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      if (active.data.current?.type === 'card') {
        setActiveTask(active.data.current.card as TaskCardBrief);
        onDragStartClosesDrawer();
        sourceListIdRef.current = active.data.current.listId as number;
        optimisticListIdRef.current = active.data.current.listId as number;
      }
      previousCacheRef.current = queryClient.getQueryData<Project>(['projects', projectId]);
    },
    [queryClient, projectId, onDragStartClosesDrawer],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.data.current?.type !== 'card') return;

      const activeCardId = active.id as number;
      let overListId: number;
      if (over.data.current?.type === 'card') {
        overListId = over.data.current.listId as number;
      } else if (over.data.current?.type === 'column') {
        overListId = (over.data.current.list as TaskListSummary).id;
      } else {
        return;
      }

      const prevOptimisticListId = optimisticListIdRef.current;
      if (prevOptimisticListId === overListId) return;

      queryClient.setQueryData<Project>(['projects', projectId], (old) => {
        if (!old?.lists) return old;
        const currentList = old.lists.find((l) => l.id === prevOptimisticListId);
        const cardInCache = currentList?.tasks.find((t) => t.id === activeCardId);
        if (!cardInCache) return old;
        const targetList = old.lists.find((l) => l.id === overListId);
        if (!targetList) return old;

        return {
          ...old,
          lists: old.lists.map((l) => {
            if (l.id === prevOptimisticListId) {
              const filtered = l.tasks.filter((t) => t.id !== activeCardId);
              return { ...l, tasks: filtered, taskCount: filtered.length };
            }
            if (l.id === overListId) {
              const deduped = l.tasks.filter((t) => t.id !== activeCardId);
              deduped.push(cardInCache);
              return { ...l, tasks: deduped, taskCount: deduped.length };
            }
            return l;
          }),
        };
      });
      optimisticListIdRef.current = overListId;
    },
    [queryClient, projectId],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) {
        if (previousCacheRef.current) {
          queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
        } else {
          queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        }
        sourceListIdRef.current = null;
        optimisticListIdRef.current = null;
        return;
      }

      // Column reorder
      if (active.data.current?.type === 'column') {
        const oldIndex = lists.findIndex((l) => `list-${l.id}` === active.id);
        const newIndex = lists.findIndex((l) => `list-${l.id}` === over.id);
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          const items = computeSortOrders(lists, oldIndex, newIndex);
          taskListApi.reorder(projectId, items)
            .catch(() => {
              if (previousCacheRef.current)
                queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
              message.error('列排序失败');
            })
            .finally(() => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }));
        }
        return;
      }

      // Card drag
      if (active.data.current?.type !== 'card') return;

      const activeCard = active.data.current.card as TaskCardBrief;
      const sourceListId = sourceListIdRef.current ?? (active.data.current.listId as number);
      sourceListIdRef.current = null;
      optimisticListIdRef.current = null;

      let targetListId: number;
      if (over.data.current?.type === 'card') {
        targetListId = over.data.current.listId as number;
      } else if (over.data.current?.type === 'column') {
        targetListId = (over.data.current.list as TaskListSummary).id;
      } else {
        if (previousCacheRef.current) {
          queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
        } else {
          queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        }
        return;
      }

      const targetList = lists.find((l) => l.id === targetListId);
      let targetIndex = targetList?.tasks.length ?? 0;
      if (over.data.current?.type === 'card') {
        const idx = targetList?.tasks.findIndex((t) => t.id === over.id) ?? -1;
        if (idx >= 0) targetIndex = idx;
      }

      if (sourceListId !== targetListId) {
        moveTask.mutate(
          { id: activeCard.id, data: { targetListId, sortOrder: targetIndex * 1000 } },
          {
            onError: () => {
              if (previousCacheRef.current)
                queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
              message.error('移动失败');
            },
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
          },
        );
        return;
      }

      // Within-column reorder
      const sourceList = lists.find((l) => l.id === sourceListId);
      if (!sourceList) return;
      const oldIndex = sourceList.tasks.findIndex((t) => t.id === activeCard.id);
      if (oldIndex < 0 || oldIndex === targetIndex) {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        return;
      }

      const items = computeSortOrders(sourceList.tasks, oldIndex, targetIndex);
      queryClient.setQueryData<Project>(['projects', projectId], (old) => {
        if (!old?.lists) return old;
        return {
          ...old,
          lists: old.lists.map((l) => {
            if (l.id === sourceListId) {
              const reordered = [...l.tasks];
              const [moved] = reordered.splice(oldIndex, 1);
              reordered.splice(targetIndex, 0, moved);
              return { ...l, tasks: reordered.map((t, i) => ({ ...t, sortOrder: i * 1000 })) };
            }
            return l;
          }),
        };
      });

      taskApi.reorder(sourceListId, items)
        .catch(() => {
          if (previousCacheRef.current)
            queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
          message.error('排序失败');
        })
        .finally(() => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }));
    },
    [lists, moveTask, queryClient, projectId],
  );

  const handleDragCancel = useCallback(() => {
    if (previousCacheRef.current) {
      queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
    }
    sourceListIdRef.current = null;
    optimisticListIdRef.current = null;
    setActiveTask(null);
  }, [queryClient, projectId]);

  // Cleanup refs on unmount
  useEffect(() => {
    return () => {
      sourceListIdRef.current = null;
      optimisticListIdRef.current = null;
    };
  }, []);

  return {
    activeTask,
    sensors,
    collisionDetection,
    dropAnimation,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
