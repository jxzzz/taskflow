import { useCallback, useRef } from 'react';
import { message } from 'antd';
import type { CreateTaskRequest } from '@/types/task';
import type { TaskListSummary } from '@/types/task';

interface UseTaskCreationParams {
  lists: TaskListSummary[];
  projectId: number;
  taskCreateListId: number | undefined;
  createList: { mutate: (name: string, opts?: any) => void; isPending: boolean };
  createTask: { mutate: (args: { listId: number; data: CreateTaskRequest }, opts?: any) => void };
  queryClient: { invalidateQueries: (args: any) => void };
  onQuickAddClose: () => void;
  onTaskCreateClose: () => void;
}

export function useTaskCreation({
  lists,
  projectId,
  taskCreateListId,
  createList,
  createTask,
  queryClient,
  onQuickAddClose,
  onTaskCreateClose,
}: UseTaskCreationParams) {
  const bootstrappingRef = useRef(false);

  const handleQuickAddSubmit = useCallback(
    (data: { title: string; dueDate?: string; priority?: number }) => {
      const targetListId = lists[0]?.id;
      if (!targetListId) {
        createList.mutate('To Do', {
          onSuccess: (newList: any) => {
            const listId = newList?.id;
            if (listId) {
              createTask.mutate(
                { listId, data: { title: data.title, dueDate: data.dueDate, priority: data.priority } },
                { onSuccess: () => { onQuickAddClose(); message.success('任务已创建 ✨'); } },
              );
            }
          },
        });
        return;
      }
      createTask.mutate(
        { listId: targetListId, data: { title: data.title, dueDate: data.dueDate, priority: data.priority } },
        { onSuccess: () => { onQuickAddClose(); message.success('任务已创建 ✨'); } },
      );
    },
    [lists, createList, createTask, onQuickAddClose],
  );

  const handleTaskCreateSubmit = useCallback(
    (data: { title: string; content?: string; priority?: number; dueDate?: string; checklistItems?: string[] }) => {
      const targetListId = taskCreateListId || lists[0]?.id;
      if (!targetListId) {
        createList.mutate('To Do', {
          onSuccess: (newList: any) => {
            const listId = newList?.id;
            if (listId) {
              createTask.mutate(
                { listId, data },
                { onSuccess: () => { onTaskCreateClose(); message.success('任务已创建 ✨'); } },
              );
            }
          },
        });
        return;
      }
      createTask.mutate(
        { listId: targetListId, data },
        { onSuccess: () => { onTaskCreateClose(); message.success('任务已创建 ✨'); } },
      );
    },
    [lists, taskCreateListId, createList, createTask, onTaskCreateClose],
  );

  const handleBootstrap = useCallback(async () => {
    if (bootstrappingRef.current) return;
    bootstrappingRef.current = true;

    const { taskApi, taskListApi } = await import('@/api/tasks');

    const listNames = ['To Do', 'Doing', 'Done'];
    const sampleTasks = [
      {
        title: '📋 在这里添加待办任务',
        content:
          '这是 **To Do** 列，所有新任务都会出现在这里。\n\n' +
          '你可以：\n' +
          '- 点击卡片右上角 **+** 创建任务\n' +
          '- 拖拽卡片到其他列\n' +
          '- 点击卡片查看详情并添加检查项',
        checklistItems: ['创建第一个任务', '尝试拖拽卡片', '打开任务详情添加检查项'],
        priority: 0,
      },
      {
        title: '🚀 正在进行的任务放这里',
        content:
          '把进行中的任务拖到 **Doing** 列，让团队知道你在做什么。\n\n' +
          '任务卡片支持：\n' +
          '- Markdown 描述\n' +
          '- 优先级标记\n' +
          '- 截止日期\n' +
          '- 检查项清单',
        checklistItems: ['了解卡片功能', '设置任务优先级', '添加截止日期'],
        priority: 1,
      },
      {
        title: '✅ 已完成的任务',
        content:
          '这是 **Done** 列，已完成的任务会自动归档到这里。\n\n' +
          '回顾已完成的任务可以帮助你：\n' +
          '- 了解团队进展\n' +
          '- 发现可优化的流程\n' +
          '- 保持成就感 ✨',
        checklistItems: ['回顾已完成的任务', '整理看板，归档旧任务'],
        priority: 0,
      },
    ];

    try {
      const lists = await Promise.all(
        listNames.map((name) => taskListApi.create(projectId, { name })),
      );
      await Promise.all(
        lists.map((list, i) =>
          taskApi.create(list.id, {
            title: sampleTasks[i].title,
            content: sampleTasks[i].content,
            checklistItems: sampleTasks[i].checklistItems,
            priority: sampleTasks[i].priority,
          }),
        ),
      );
      message.success('看板已就绪 ✨');
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    } catch {
      message.error('初始化失败，请重试');
    } finally {
      bootstrappingRef.current = false;
    }
  }, [projectId, queryClient]);

  return { handleQuickAddSubmit, handleTaskCreateSubmit, handleBootstrap };
}
