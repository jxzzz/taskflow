import { useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { DragStart, DropResult } from '@hello-pangea/dnd';
import { useMoveTask } from '@/hooks/useTasks';

import { taskApi, taskListApi } from '@/api/tasks';
import type { TaskListSummary } from '@/types/task';
import { computeSortOrders } from '@/hooks/useKanbanMutations';

interface UseKanbanDragParams {
  projectId: number;
  lists: TaskListSummary[];
  setLists: (lists: TaskListSummary[]) => void;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  onDragStartClosesDrawer: () => void;
}

// ---- ID helpers (shared convention with KanbanColumn / KanbanCard) ----

const COL_PREFIX = 'col-';
const CARD_PREFIX = 'card-';
export const BOARD_DROPPABLE = 'board';
const LIST_DROPPABLE_PREFIX = 'list-';

export function makeColId(listId: number): string {
  return `${COL_PREFIX}${listId}`;
}
export function makeCardId(taskId: number): string {
  return `${CARD_PREFIX}${taskId}`;
}
function parseCardId(id: string): number | null {
  if (!id.startsWith(CARD_PREFIX)) return null;
  return Number(id.slice(CARD_PREFIX.length));
}
function parseListDroppableId(droppableId: string): number | null {
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

  // ---- onDragUpdate ----
  // rbd handles visual feedback via CSS transform — no React state updates needed here.
  const handleDragUpdate = useCallback(() => {}, []);

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

      if (source.droppableId === destination.droppableId && source.index === destination.index)
        return;

      const snapshot = snapshotRef.current;
      if (!snapshot) return;

      // ---- Column reorder ----
      if (type === 'COLUMN') {
        const reordered = [...snapshot.columnOrder];
        const [removed] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, removed);
        setColumnOrder(reordered);

        const items = reordered.map((colId, index) => ({
          id: Number(colId.replace('list-', '')),
          sortOrder: index * 1000,
        }));
        taskListApi
          .reorder(projectId, items)
          .catch(() => {
            setColumnOrder(snapshot.columnOrder);
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

        // Within-column reorder
        if (srcListId === dstListId) {
          const originalSrcList = snapshot.lists.find((l) => l.id === srcListId);
          if (!originalSrcList) return;

          const items = computeSortOrders(originalSrcList.tasks, source.index, destination.index);

          // Optimistic update
          const reordered = [...originalSrcList.tasks];
          const [moved] = reordered.splice(source.index, 1);
          reordered.splice(destination.index, 0, moved);
          setLists(
            snapshot.lists.map((l) =>
              l.id === srcListId ? { ...l, tasks: reordered, taskCount: reordered.length } : l,
            ),
          );

          taskApi
            .reorder(projectId, srcListId, items)
            .catch(() => {
              setLists(snapshot.lists);
              message.error('排序失败');
            })
            .finally(() => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }));
          return;
        }

        // Cross-column move
        const srcList = snapshot.lists.find((l) => l.id === srcListId);
        const dstList = snapshot.lists.find((l) => l.id === dstListId);
        if (!srcList || !dstList) return;

        const srcTasks = [...srcList.tasks];
        const [moved] = srcTasks.splice(source.index, 1);
        const dstTasks = [...dstList.tasks];
        dstTasks.splice(destination.index, 0, moved);

        setLists(
          snapshot.lists.map((l) => {
            if (l.id === srcListId) return { ...l, tasks: srcTasks, taskCount: srcTasks.length };
            if (l.id === dstListId) return { ...l, tasks: dstTasks, taskCount: dstTasks.length };
            return l;
          }),
        );

        moveTask.mutate(
          {
            id: cardId,
            data: { targetListId: dstListId, sortOrder: destination.index * 1000 },
          },
          {
            onError: () => {
              setLists(snapshot.lists);
            },
          },
        );
      }
    },
    [setLists, setColumnOrder, moveTask, queryClient, projectId],
  );

  return { handleDragStart, handleDragUpdate, handleDragEnd };
}
