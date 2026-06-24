import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Space,
  Tag,
  Spin,
  Typography,
  Input,
  Empty,
  Drawer,
  Descriptions,
  Skeleton,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import dayjs from 'dayjs';
import { useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/common/PageHeader';
import EmptyKanban from '@/components/common/EmptyKanban';
import QuickAddModal from '@/components/common/QuickAddModal';
import KanbanColumn from '@/pages/projects/KanbanColumn';
import KanbanCard from '@/pages/projects/KanbanCard';
import { useProject } from '@/hooks/useProjects';
import { useCreateTaskList } from '@/hooks/useTaskLists';
import { useCreateTask, useMoveTask, useTaskDetail } from '@/hooks/useTasks';
import { computeSortOrders } from '@/hooks/useKanbanMutations';
import { taskApi, taskListApi } from '@/api/tasks';
import type { TaskCardBrief, TaskListSummary } from '@/types/task';
import type { Project } from '@/types/project';

const { Text, Title } = Typography;

/** ==================== 主页面 ==================== */

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);
  const { data: project, isLoading } = useProject(projectId);
  const createList = useCreateTaskList(projectId);
  const [newListName, setNewListName] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const { data: taskDetail, isFetching: taskLoading } = useTaskDetail(selectedTaskId);

  // Quick-add command palette
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const createTask = useCreateTask();

  const lists = project?.lists || [];
  const listCount = lists.length;

  // ====== Drag & Drop State ======
  const queryClient = useQueryClient();
  const moveTask = useMoveTask();
  const [activeTask, setActiveTask] = useState<TaskCardBrief | null>(null);
  const previousCacheRef = useRef<Project | undefined>(undefined);
  // Record source list ID at drag start (before optimistic move changes active.data.current.listId)
  const sourceListIdRef = useRef<number | null>(null);
  // Track where the card currently lives in the optimistic cache (updates each time we move it)
  const optimisticListIdRef = useRef<number | null>(null);

  // Sensors: 5px activation constraint prevents accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Custom collision: pointerWithin primary, closestCenter fallback
  const kanbanCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return closestCenter(args);
  };

  // Drop animation with design-system easing
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          transition: 'transform 250ms cubic-bezier(0.19, 1, 0.22, 1), opacity 200ms ease',
        },
      },
    }),
  };

  /** Drag start: snapshot cache for rollback, close detail drawer */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      if (active.data.current?.type === 'card') {
        setActiveTask(active.data.current.card as TaskCardBrief);
        // Close detail drawer if open
        setSelectedTaskId(null);
        // Snapshot source list ID before optimistic move overwrites it
        sourceListIdRef.current = active.data.current.listId as number;
        optimisticListIdRef.current = active.data.current.listId as number;
      }
      // Snapshot project cache for rollback on cancel
      previousCacheRef.current = queryClient.getQueryData<Project>(['projects', projectId]);
    },
    [queryClient, projectId],
  );

  /** Drag over: visually move card between lists in cache for instant feedback */
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.data.current?.type !== 'card') return;

      const activeCardId = active.id as number;

      // Determine target list from over element
      let overListId: number;
      if (over.data.current?.type === 'card') {
        overListId = over.data.current.listId as number;
      } else if (over.data.current?.type === 'column') {
        overListId = (over.data.current.list as TaskListSummary).id;
      } else {
        return;
      }

      // Skip if card is already in the target list at the right position
      const prevOptimisticListId = optimisticListIdRef.current;
      if (prevOptimisticListId === overListId) return;

      // Optimistically move card: remove from current location, insert into target
      queryClient.setQueryData<Project>(['projects', projectId], (old) => {
        if (!old?.lists) return old;
        // Find the card wherever it currently lives in the cache
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

  /** Drag end: persist changes to server */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) {
        // Dropped in empty space — restore snapshot
        if (previousCacheRef.current) {
          queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
        } else {
          queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        }
        sourceListIdRef.current = null;
        optimisticListIdRef.current = null;
        return;
      }

      // --- Column reorder ---
      if (active.data.current?.type === 'column') {
        const oldIndex = lists.findIndex((l) => `list-${l.id}` === active.id);
        const newIndex = lists.findIndex((l) => `list-${l.id}` === over.id);
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          const items = computeSortOrders(lists, oldIndex, newIndex);
          taskListApi
            .reorder(projectId, items)
            .catch(() => {
              if (previousCacheRef.current)
                queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
              message.error('列排序失败');
            })
            .finally(() => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }));
        }
        return;
      }

      // --- Card drag ---
      if (active.data.current?.type !== 'card') return;

      const activeCard = active.data.current.card as TaskCardBrief;
      const sourceListId = sourceListIdRef.current ?? (active.data.current.listId as number);
      sourceListIdRef.current = null;
      optimisticListIdRef.current = null;

      // Determine target list from the drop target
      let targetListId: number;
      if (over.data.current?.type === 'card') {
        targetListId = over.data.current.listId as number;
      } else if (over.data.current?.type === 'column') {
        targetListId = (over.data.current.list as TaskListSummary).id;
      } else {
        // Unknown drop target — restore snapshot
        if (previousCacheRef.current) {
          queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
        } else {
          queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        }
        return;
      }

      // Determine target index
      const targetList = lists.find((l) => l.id === targetListId);
      let targetIndex = targetList?.tasks.length ?? 0;
      if (over.data.current?.type === 'card') {
        const idx = targetList?.tasks.findIndex((t) => t.id === over.id) ?? -1;
        if (idx >= 0) targetIndex = idx;
      }

      if (sourceListId !== targetListId) {
        // --- Cross-column move ---
        // handleDragOver already moved the card optimistically, just call API
        moveTask.mutate(
          {
            id: activeCard.id,
            data: { targetListId, sortOrder: targetIndex * 1000 },
          },
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

      // --- Within-column reorder ---
      const sourceList = lists.find((l) => l.id === sourceListId);
      if (!sourceList) return;
      const oldIndex = sourceList.tasks.findIndex((t) => t.id === activeCard.id);
      if (oldIndex < 0 || oldIndex === targetIndex) {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        return;
      }

      const items = computeSortOrders(sourceList.tasks, oldIndex, targetIndex);

      // Optimistic: update cache immediately so cards don't snap back
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

      taskApi
        .reorder(sourceListId, items)
        .catch(() => {
          if (previousCacheRef.current)
            queryClient.setQueryData(['projects', projectId], previousCacheRef.current);
          message.error('排序失败');
        })
        .finally(() => queryClient.invalidateQueries({ queryKey: ['projects', projectId] }));
    },
    [lists, moveTask, queryClient, projectId],
  );

  /** Drag cancel: restore snapshot */
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

  /** Handle quick-add submission: create task in the selected/default list */
  const handleQuickAddSubmit = useCallback(
    (data: { title: string; dueDate?: string; priority?: number }) => {
      const targetListId = lists[0]?.id;
      if (!targetListId) {
        // No lists exist — create one first, then the task will be created
        createList.mutate('To Do', {
          onSuccess: (newList) => {
            const listId = (newList as any)?.id;
            if (listId) {
              createTask.mutate(
                {
                  listId,
                  data: { title: data.title, dueDate: data.dueDate, priority: data.priority },
                },
                {
                  onSuccess: () => {
                    setQuickAddOpen(false);
                    message.success('任务已创建 ✨');
                  },
                },
              );
            }
          },
        });
        return;
      }
      createTask.mutate(
        {
          listId: targetListId,
          data: { title: data.title, dueDate: data.dueDate, priority: data.priority },
        },
        {
          onSuccess: () => {
            setQuickAddOpen(false);
            message.success('任务已创建 ✨');
          },
        },
      );
    },
    [lists, createList, createTask],
  );

  /** Quick-start: create a default "To Do" list so the user can begin adding tasks */
  const handleCreateFirstList = useCallback(() => {
    if (createList.isPending) return;
    createList.mutate('To Do', {
      onSuccess: () => {
        message.success('列表已创建，开始添加任务吧 ✨');
      },
    });
  }, [createList]);

  /** Keyboard shortcut: N to create first list */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (listCount === 0 && !addingList) {
          handleCreateFirstList();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listCount, addingList, handleCreateFirstList]);

  /** Keyboard shortcut: Cmd+K / Ctrl+K to open quick-add */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading)
    return (
      <div style={{ textAlign: 'center', padding: 120 }}>
        <Spin />
      </div>
    );
  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4} style={{ color: 'rgba(43,40,37,0.4)' }}>
          项目不存在
        </Title>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/projects')}
          style={{ marginTop: 16 }}
        >
          返回项目列表
        </Button>
      </div>
    );
  }

  const handleAddList = () => {
    if (!newListName.trim()) return;
    createList.mutate(newListName.trim(), {
      onSuccess: () => {
        setNewListName('');
        setAddingList(false);
      },
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 112px)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <PageHeader
        title={project.name}
        subtitle={project.description || undefined}
        breadcrumb={[{ title: '项目', path: '/projects' }, { title: project.name }]}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
              返回
            </Button>
            <Button type="primary" icon={<EditOutlined />} style={{ borderRadius: 50 }}>
              编辑
            </Button>
          </Space>
        }
      />

      {/* Info bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 0',
          marginBottom: 8,
        }}
      >
        <Tag
          style={{
            background: 'var(--tag-lavender)',
            color: 'var(--tag-lavender-text)',
            border: 'none',
            margin: 0,
          }}
        >
          {project.ownerName || `用户 #${project.ownerId}`}
        </Tag>
        <Text style={{ fontSize: 12, color: 'var(--color-ink-disabled)' }}>·</Text>
        <TeamOutlined style={{ color: 'var(--color-lavender)', fontSize: 13 }} />
        <Text style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          {project.memberCount} 人
        </Text>
        <Text style={{ fontSize: 12, color: 'var(--color-ink-disabled)' }}>·</Text>
        <ClockCircleOutlined style={{ color: 'var(--color-ink-tertiary)', fontSize: 13 }} />
        <Text style={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
          {project.createTime ? dayjs(project.createTime).format('YYYY-MM-DD') : '—'}
        </Text>
      </div>

      {/* Kanban board — DndContext for drag-and-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={kanbanCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={{
          announcements: {
            onDragStart({ active }) {
              const card = active.data.current?.card as TaskCardBrief | undefined;
              return card ? `已拾取卡片 "${card.title}"` : '已拾取';
            },
            onDragOver({ over }) {
              if (!over) return '无可放置目标';
              return `移动到位置 ${(over.data.current?.sortable?.index ?? 0) + 1}`;
            },
            onDragEnd({ over }) {
              if (!over) return '已放回原位';
              return `已放置到位置 ${(over.data.current?.sortable?.index ?? 0) + 1}`;
            },
            onDragCancel() {
              return '拖拽已取消';
            },
          },
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            gap: 14,
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: 16,
            alignItems: 'stretch',
            minHeight: 0,
          }}
        >
          <SortableContext
            items={lists.map((l) => `list-${l.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            {lists.map((list) => (
              <KanbanColumn
                key={list.id}
                list={list}
                projectId={projectId}
                allLists={lists}
                onCardMoved={() => {}}
                onCardClick={(cardId) => setSelectedTaskId(cardId)}
                onTaskDeleted={(taskId) => {
                  if (taskId === selectedTaskId) setSelectedTaskId(null);
                }}
              />
            ))}
          </SortableContext>

          {/* Add list column */}
          {addingList ? (
            <div
              style={{
                width: 260,
                minWidth: 260,
                flexShrink: 0,
                background: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 14,
              }}
            >
              <Input
                autoFocus
                size="small"
                placeholder="列表名称"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onPressEnter={handleAddList}
                style={{ marginBottom: 8, borderRadius: 'var(--radius-sm)' }}
              />
              <Space size={6}>
                <Button
                  size="small"
                  type="primary"
                  onClick={handleAddList}
                  loading={createList.isPending}
                  style={{ borderRadius: 'var(--radius-xs)' }}
                >
                  添加
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setAddingList(false);
                    setNewListName('');
                  }}
                  style={{ borderRadius: 'var(--radius-xs)' }}
                >
                  取消
                </Button>
              </Space>
            </div>
          ) : (
            <Button
              icon={<PlusOutlined />}
              onClick={() => setAddingList(true)}
              style={{
                minWidth: 200,
                flexShrink: 0,
                borderRadius: 'var(--radius-lg)',
                fontSize: 13,
                color: 'var(--color-ink-tertiary)',
                height: 44,
              }}
            >
              添加列表
            </Button>
          )}

          {/* Empty state — shown when no lists exist */}
          {lists.length === 0 && !addingList && (
            <EmptyKanban onCreateTask={handleCreateFirstList} />
          )}
        </div>

        {/* Drag overlay — rendered card during drag */}
        <DragOverlay dropAnimation={customDropAnimation} zIndex={1000}>
          {activeTask ? (
            <KanbanCard
              card={activeTask}
              listId={0}
              targetLists={[]}
              onClick={() => {}}
              onDelete={() => {}}
              onMove={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* FAB — Quick-add floating action button */}
      <button
        className="quick-add-fab"
        onClick={() => setQuickAddOpen(true)}
        title="Quick Add Task (⌘K)"
        style={{
          position: 'fixed',
          bottom: 32,
          right: 36,
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #5B9FED 0%, #4A85D9 50%, #3D6FBF 100%)',
          color: '#fff',
          fontSize: 22,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99,
          boxShadow: '0 4px 16px rgba(74, 133, 217, 0.35), 0 0 0 2px rgba(74, 133, 217, 0.1)',
          transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <ThunderboltOutlined style={{ fontSize: 20 }} />
      </button>

      {/* Quick-add command palette */}
      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSubmit={handleQuickAddSubmit}
        lists={lists}
      />

      {/* Task detail drawer */}
      <Drawer
        title={taskDetail?.title || '卡片详情'}
        open={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        width={480}
        destroyOnClose
        styles={{ body: { padding: '20px 24px' } }}
      >
        {taskLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : taskDetail ? (
          <div>
            {/* Priority + Status */}
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="优先级">
                <Tag
                  color={
                    taskDetail.priority === 2
                      ? 'red'
                      : taskDetail.priority === 1
                        ? 'orange'
                        : 'default'
                  }
                >
                  {taskDetail.priorityLabel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="列表">{taskDetail.listName}</Descriptions.Item>
              {taskDetail.dueDate && (
                <Descriptions.Item label="截止日期">
                  <Text style={{ color: taskDetail.isOverdue ? 'var(--color-coral)' : undefined }}>
                    {dayjs(taskDetail.dueDate).format('YYYY-MM-DD HH:mm')}
                    {taskDetail.isOverdue && ' (已逾期)'}
                  </Text>
                </Descriptions.Item>
              )}
              {taskDetail.assigneeName && (
                <Descriptions.Item label="负责人">{taskDetail.assigneeName}</Descriptions.Item>
              )}
            </Descriptions>

            {/* Content */}
            {taskDetail.content ? (
              <div
                style={{
                  background: 'var(--color-bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: 'var(--color-ink-primary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {taskDetail.content}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无详细描述"
                style={{ marginTop: 24 }}
              />
            )}

            {/* Meta info */}
            <div
              style={{
                marginTop: 24,
                padding: '12px 0',
                borderTop: '1px solid var(--color-border-subtle)',
              }}
            >
              <Space size={24}>
                <Text style={{ fontSize: 11, color: 'var(--color-ink-disabled)' }}>
                  创建于 {dayjs(taskDetail.createTime).format('YYYY-MM-DD HH:mm')}
                </Text>
                <Text style={{ fontSize: 11, color: 'var(--color-ink-disabled)' }}>
                  更新于 {dayjs(taskDetail.updateTime).format('YYYY-MM-DD HH:mm')}
                </Text>
              </Space>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
