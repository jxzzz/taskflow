import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Space,
  Spin,
  Tag,
  Typography,
  Input,
  Empty,
  Drawer,
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
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import dayjs from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import EmptyKanban from '@/components/common/EmptyKanban';
import QuickAddModal from '@/components/common/QuickAddModal';
import TaskCreateModal from '@/components/common/TaskCreateModal';
import TaskDetailContent from '@/pages/projects/TaskDetailContent';
import KanbanColumn from '@/pages/projects/KanbanColumn';
import KanbanCard from '@/pages/projects/KanbanCard';
import { useProject } from '@/hooks/useProjects';
import { useCreateTaskList } from '@/hooks/useTaskLists';
import { useCreateTask, useTaskDetail } from '@/hooks/useTasks';
import { useKanbanDrag } from '@/pages/projects/useKanbanDrag';
import { useTaskCreation } from '@/pages/projects/useTaskCreation';
import { useKanbanShortcuts } from '@/pages/projects/useKanbanShortcuts';
import { useQueryClient } from '@tanstack/react-query';
import type { TaskCardBrief, TaskListSummary } from '@/types/task';

const { Text, Title } = Typography;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);
  const queryClient = useQueryClient();

  // ---- Data ----
  const { data: project, isLoading } = useProject(projectId);
  const createList = useCreateTaskList(projectId);
  const createTask = useCreateTask();
  const lists = project?.lists || [];
  const listCount = lists.length;

  // ---- UI state ----
  const [newListName, setNewListName] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const { data: taskDetail, isFetching: taskLoading } = useTaskDetail(selectedTaskId);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [taskCreateOpen, setTaskCreateOpen] = useState(false);
  const [taskCreateListId, setTaskCreateListId] = useState<number | undefined>();

  // ---- Drag & Drop ----
  const {
    activeTask,
    sensors,
    collisionDetection,
    dropAnimation,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDrag({
    projectId,
    lists,
    onDragStartClosesDrawer: () => setSelectedTaskId(null),
  });

  // ---- Task creation ----
  const { handleQuickAddSubmit, handleTaskCreateSubmit, handleBootstrap } = useTaskCreation({
    lists,
    projectId,
    taskCreateListId,
    createList,
    createTask,
    queryClient,
    onQuickAddClose: () => setQuickAddOpen(false),
    onTaskCreateClose: () => setTaskCreateOpen(false),
  });

  // ---- Keyboard shortcuts ----
  useKanbanShortcuts({
    listCount,
    addingList,
    onBootstrap: handleBootstrap,
    onOpenQuickAdd: () => setQuickAddOpen(true),
  });

  // ---- Add list ----
  const handleAddList = () => {
    if (!newListName.trim()) return;
    createList.mutate(newListName.trim(), {
      onSuccess: () => { setNewListName(''); setAddingList(false); },
    });
  };

  // ---- Early returns ----
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 120 }}>
        <Spin />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4} style={{ color: 'rgba(43,40,37,0.4)' }}>项目不存在</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')} style={{ marginTop: 16 }}>
          返回项目列表
        </Button>
      </div>
    );
  }

  // ---- Main render ----
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)', overflow: 'hidden' }}>
      {/* Header */}
      <PageHeader
        title={project.name}
        subtitle={project.description || undefined}
        breadcrumb={[{ title: '项目', path: '/projects' }, { title: project.name }]}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>返回</Button>
            <Button type="primary" icon={<EditOutlined />} style={{ borderRadius: 50 }}>编辑</Button>
          </Space>
        }
      />

      {/* Info bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', marginBottom: 8 }}>
        <Tag style={{ background: 'var(--tag-lavender)', color: 'var(--tag-lavender-text)', border: 'none', margin: 0 }}>
          {project.ownerName || `用户 #${project.ownerId}`}
        </Tag>
        <Text style={{ fontSize: 12, color: 'var(--color-ink-disabled)' }}>·</Text>
        <TeamOutlined style={{ color: 'var(--color-lavender)', fontSize: 13 }} />
        <Text style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>{project.memberCount} 人</Text>
        <Text style={{ fontSize: 12, color: 'var(--color-ink-disabled)' }}>·</Text>
        <ClockCircleOutlined style={{ color: 'var(--color-ink-tertiary)', fontSize: 13 }} />
        <Text style={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
          {project.createTime ? dayjs(project.createTime).format('YYYY-MM-DD') : '—'}
        </Text>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
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
            onDragCancel() { return '拖拽已取消'; },
          },
        }}
      >
        <div style={{ flex: 1, display: 'flex', gap: 14, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 16, alignItems: 'stretch', minHeight: 0 }}>
          <SortableContext items={lists.map((l) => `list-${l.id}`)} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <KanbanColumn
                key={list.id}
                list={list}
                projectId={projectId}
                allLists={lists}
                onCardMoved={() => {}}
                onCardClick={(cardId) => setSelectedTaskId(cardId)}
                onTaskDeleted={(taskId) => { if (taskId === selectedTaskId) setSelectedTaskId(null); }}
                onAddTask={(listId) => { setTaskCreateListId(listId); setTaskCreateOpen(true); }}
              />
            ))}
          </SortableContext>

          {/* Add list column */}
          {addingList ? (
            <div style={{ width: 260, minWidth: 260, flexShrink: 0, background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
              <Input
                autoFocus size="small" placeholder="列表名称"
                value={newListName} onChange={(e) => setNewListName(e.target.value)}
                onPressEnter={handleAddList}
                style={{ marginBottom: 8, borderRadius: 'var(--radius-sm)' }}
              />
              <Space size={6}>
                <Button size="small" type="primary" onClick={handleAddList} loading={createList.isPending} style={{ borderRadius: 'var(--radius-xs)' }}>添加</Button>
                <Button size="small" onClick={() => { setAddingList(false); setNewListName(''); }} style={{ borderRadius: 'var(--radius-xs)' }}>取消</Button>
              </Space>
            </div>
          ) : (
            <Button
              icon={<PlusOutlined />}
              onClick={() => setAddingList(true)}
              style={{ minWidth: 200, flexShrink: 0, borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--color-ink-tertiary)', height: 44 }}
            >
              添加列表
            </Button>
          )}

          {/* Empty state */}
          {lists.length === 0 && !addingList && (
            <EmptyKanban onCreateTask={handleBootstrap} />
          )}
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={dropAnimation} zIndex={1000}>
          {activeTask ? (
            <KanbanCard card={activeTask} listId={0} targetLists={[]} onClick={() => {}} onDelete={() => {}} onMove={() => {}} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* FAB — Quick-add */}
      <button
        className="quick-add-fab"
        onClick={() => setQuickAddOpen(true)}
        title="Quick Add Task (⌘K)"
        style={{
          position: 'fixed', bottom: 32, right: 36, width: 52, height: 52,
          borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #5B9FED 0%, #4A85D9 50%, #3D6FBF 100%)',
          color: '#fff', fontSize: 22, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99,
          boxShadow: '0 4px 16px rgba(74, 133, 217, 0.35), 0 0 0 2px rgba(74, 133, 217, 0.1)',
          transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <ThunderboltOutlined style={{ fontSize: 20 }} />
      </button>

      {/* Quick-add modal */}
      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} onSubmit={handleQuickAddSubmit} lists={lists} />

      {/* Task create modal */}
      <TaskCreateModal open={taskCreateOpen} onClose={() => setTaskCreateOpen(false)} onSubmit={handleTaskCreateSubmit} lists={lists} defaultListId={taskCreateListId} />

      {/* Task detail drawer */}
      <Drawer
        title={taskDetail?.title ?? '加载中...'}
        open={selectedTaskId !== null}
        onClose={() => setSelectedTaskId(null)}
        width={480}
        destroyOnClose
        styles={{ body: { padding: '20px 24px' } }}
      >
        {taskLoading && <Skeleton active paragraph={{ rows: 6 }} />}
        {!taskLoading && taskDetail && <TaskDetailContent task={taskDetail} />}
        {!taskLoading && !taskDetail && <Empty description="未找到该任务" style={{ marginTop: 40 }} />}
      </Drawer>
    </div>
  );
}
