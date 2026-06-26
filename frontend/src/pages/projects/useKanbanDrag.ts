import { useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { DragStart, DragUpdate, DropResult } from '@hello-pangea/dnd';
import { useMoveTask } from '@/hooks/useTasks';

import { taskApi, taskListApi } from '@/api/tasks';
import type { TaskListSummary } from '@/types/task';

interface UseKanbanDragParams {
  projectId: number;
  lists: TaskListSummary[];
  setLists: (lists: TaskListSummary[]) => void;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  onDragStartClosesDrawer: () => void;
}

// ---- ID helpers (shared convention with KanbanColumn / KanbanCard) ----

export const COL_PREFIX = 'col-';
export const CARD_PREFIX = 'card-';
export const BOARD_DROPPABLE = 'board';
export const LIST_DROPPABLE_PREFIX = 'list-';

export function makeColId(listId: number): string {
  return `${COL_PREFIX}${listId}`;
}
export function parseColId(id: string): number | null {
  if (!id.startsWith(COL_PREFIX)) return null;
  return Number(id.slice(COL_PREFIX.length));
}
export function makeCardId(taskId: number): string {
  return `${CARD_PREFIX}${taskId}`;
}
export function parseCardId(id: string): number | null {
  if (!id.startsWith(CARD_PREFIX)) return null;
  return Number(id.slice(CARD_PREFIX.length));
}
export function parseListDroppableId(droppableId: string): number | null {
  if (!droppableId.startsWith(LIST_DROPPABLE_PREFIX)) return null;
  return Number(droppableId.slice(LIST_DROPPABLE_PREFIX.length));
}

export function useKanbanDrag({
  projectId,
  lists,
  setLists,
  columnOrder,
  setColumnOrder,
  onDragStartClosesDrawer,
}: UseKanbanDragParams) {
  const queryClient = useQueryClient();
  const moveTask = useMoveTask();

  // Refs track latest values — avoids stale closures in callbacks
  const listsRef = useRef(lists);
  listsRef.current = lists;
  const columnOrderRef = useRef(columnOrder);
  columnOrderRef.current = columnOrder;

  // Pre-drag snapshot for rollback on cancel/error
  const snapshotRef = useRef<{
    lists: TaskListSummary[];
    columnOrder: string[];
  } | null>(null);

  // ---- onDragStart ----
  const handleDragStart = useCallback(
    (_start: DragStart) => {
      onDragStartClosesDrawer();
      snapshotRef.current = {
        lists: structuredClone(listsRef.current),
        columnOrder: [...columnOrderRef.current],
      };
    },
    [onDragStartClosesDrawer],
  );

  // ---- onDragUpdate (optimistic local updates) ----
  const handleDragUpdate = useCallback(
    (update: DragUpdate) => {
      const { destination, source, type } = update;
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      if (type === 'COLUMN') {
        // Column reorder — splice columnOrder array
        const current = columnOrderRef.current;
        const reordered = [...current];
        const [removed] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, removed);
        setColumnOrder(reordered);
        return;
      }

      if (type === 'CARD') {
        // Card move/reorder — splice task arrays within lists
        const srcListId = parseListDroppableId(source.droppableId);
        const dstListId = parseListDroppableId(destination.droppableId);
        if (srcListId === null || dstListId === null) return;

        const currentLists = listsRef.current;
        const srcList = currentLists.find((l) => l.id === srcListId);
        if (!srcList) return;

        const srcTasks = [...srcList.tasks];
        const [moved] = srcTasks.splice(source.index, 1);
        if (!moved) return;

        const newSrcList = { ...srcList, tasks: srcTasks, taskCount: srcTasks.length };

        let newDstList: TaskListSummary;
        if (srcListId === dstListId) {
          // Reorder within same list — splice into the already-modified srcTasks
          srcTasks.splice(destination.index, 0, moved);
          newSrcList.tasks = srcTasks;
          newSrcList.taskCount = srcTasks.length;
          setLists(currentLists.map((l) => (l.id === srcListId ? newSrcList : l)));
          return;
        }

        // Cross-list move
        const dstList = currentLists.find((l) => l.id === dstListId);
        if (!dstList) return;

        const dstTasks = [...dstList.tasks];
        dstTasks.splice(destination.index, 0, moved);
        newDstList = { ...dstList, tasks: dstTasks, taskCount: dstTasks.length };

        setLists(
          currentLists.map((l) => {
            if (l.id === srcListId) return newSrcList;
            if (l.id === dstListId) return newDstList;
            return l;
          }),
        );
      }
    },
    [setLists, setColumnOrder],
  );

  // ---- onDragEnd (persist to server) ----
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId, type, reason } = result;

      // Cancel or dropped outside → full rollback
      if (!destination || reason === 'CANCEL') {
        if (snapshotRef.current) {
          setLists(snapshotRef.current.lists);
          setColumnOrder(snapshotRef.current.columnOrder);
        }
        return;
      }

      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      // ---- Column reorder ----
      if (type === 'COLUMN') {
        const currentColumnOrder = columnOrderRef.current;

        // Derive sort orders from the CURRENT column order (already updated by handleDragUpdate).
        // Not using computeSortOrders with source/dest indices because listsRef.current
        // may be in a different order than what the indices reference.
        const items = currentColumnOrder.map((colId, index) => ({
          id: Number(colId.replace('list-', '')),
          sortOrder: index * 1000,
        }));
        taskListApi
          .reorder(projectId, items)
          .catch(() => {
            setColumnOrder(snapshotRef.current?.columnOrder ?? currentColumnOrder);
            message.error('列排序失败');
          })
          .finally(() => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }));
        return;
      }

      // ---- Card reorder / move ----
      if (type === 'CARD') {
        const cardId = parseCardId(draggableId);
        if (cardId === null) return;

        const srcListId = parseListDroppableId(source.droppableId);
        const dstListId = parseListDroppableId(destination.droppableId);
        if (srcListId === null || dstListId === null) return;

        const currentLists = listsRef.current;

        // Within-column reorder
        if (srcListId === dstListId) {
          const srcList = currentLists.find((l) => l.id === srcListId);
          if (!srcList) return;

          // Derive sort orders from the CURRENT task order (already updated by handleDragUpdate).
          // Not using computeSortOrders with source/dest indices because tasks were already
          // re-arranged optimistically and the indices no longer match the current array.
          const items = srcList.tasks.map((task, index) => ({
            id: task.id,
            sortOrder: index * 1000,
          }));
          taskApi
            .reorder(srcListId, items)
            .catch(() => {
              if (snapshotRef.current) setLists(snapshotRef.current.lists);
              message.error('排序失败');
            })
            .finally(() => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }));
          return;
        }

        // Cross-column move
        moveTask.mutate(
          {
            id: cardId,
            data: { targetListId: dstListId, sortOrder: destination.index * 1000 },
          },
          {
            onError: () => {
              if (snapshotRef.current) setLists(snapshotRef.current.lists);
            },
          },
        );
      }
    },
    [setLists, setColumnOrder, moveTask, queryClient, projectId],
  );

  return { handleDragStart, handleDragUpdate, handleDragEnd };
}
