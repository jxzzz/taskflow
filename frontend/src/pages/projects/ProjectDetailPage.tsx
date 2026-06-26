import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  App,
  Button,
  Space,
  Spin,
  Tag,
  Typography,
  Input,
  Empty,
  Drawer,
  Skeleton,
  Segmented,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  TeamOutlined,
  CalendarOutlined,
  LinkOutlined,
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  GlobalOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { BOARD_DROPPABLE } from '@/pages/projects/useKanbanDrag';
import dayjs from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import EmptyKanban from '@/components/common/EmptyKanban';
import TaskCreateModal from '@/components/common/TaskCreateModal';
import TaskDetailContent from '@/pages/projects/TaskDetailContent';
import KanbanColumn from '@/pages/projects/KanbanColumn';
import TaskListView from '@/pages/projects/TaskListView';
import { useProject } from '@/hooks/useProjects';
import { useCreateTaskList } from '@/hooks/useTaskLists';
import { useCreateTask, useTaskDetail } from '@/hooks/useTasks';
import ProjectSettingsModal from '@/pages/projects/ProjectSettingsModal';
import { useKanbanDrag } from '@/pages/projects/useKanbanDrag';
import { useTaskCreation } from '@/pages/projects/useTaskCreation';
import { useKanbanShortcuts } from '@/pages/projects/useKanbanShortcuts';
import { useQueryClient } from '@tanstack/react-query';
import { PROJECT_STATUS_CONFIG } from '@/types/project';
import type { TaskListSummary } from '@/types/task';
import { useWhyDidYouUpdate } from '@/hooks/useWhyDidYouUpdate';

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
  const [lists, setLists] = useState(project?.lists || []);
  // ---- UI state ----
  const [newListName, setNewListName] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const {
    data: taskDetail,
    isFetching: taskLoading,
    error: taskError,
  } = useTaskDetail(selectedTaskId);
  const { message } = App.useApp();

  // 卡片详情加载失败时弹出错误提示
  useEffect(() => {
    if (taskError) {
      message.error((taskError as Error)?.message || '加载任务失败');
    }
  }, [taskError, message]);

  useEffect(() => {
    if (project?.lists) {
      setLists(project.lists);
    }
  }, [project?.lists]);

  const [taskCreateOpen, setTaskCreateOpen] = useState(false);
  const [taskCreateListId, setTaskCreateListId] = useState<number | undefined>();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isMember = project?.isMember ?? true; // 旧后端未返回时默认允许操作

  const [focusMode, setFocusMode] = useState(false);

  // ---- Column order (local state drives sortable) ----
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // Sync from server when the set of list IDs changes (init / add / remove).
  // Sorting the IDs means pure reorder does NOT trigger a resync, so our
  // local reorder survives the refetch that follows the API call.
  const listIdsKey = lists
    .map((l) => l.id)
    .sort((a, b) => a - b)
    .join(',');
  useEffect(() => {
    setColumnOrder(lists.map((l) => `list-${l.id}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listIdsKey]);

  // Derive ordered lists from columnOrder.
  // Uses `lists` (local state, may include optimistic updates) rather than
  // `snapshot.current` (server baseline) so that handleDragUpdate's optimistic
  // reorder is immediately visible during drag.  Without this, the card would
  // snap back on drop because rbd removes the drag transform, but the React
  // state hadn't changed — the visual movement was purely rbd's CSS transform.
  const orderedLists = useMemo(() => {
    if (columnOrder.length === 0) return lists;
    const map = new Map(lists.map((l) => [l.id, l] as const));
    return columnOrder
      .map((key) => map.get(Number(key.replace('list-', ''))))
      .filter((l): l is TaskListSummary => !!l);
  }, [lists, columnOrder]);
  useWhyDidYouUpdate('ProjectDetailPage', { lists } as Record<string, unknown>);

  // ---- Drag & Drop ----
  const { handleDragStart, handleDragUpdate, handleDragEnd } = useKanbanDrag({
    projectId,
    lists,
    setLists,
    columnOrder,
    setColumnOrder,
    onDragStartClosesDrawer: () => setSelectedTaskId(null),
  });

  // ---- Task creation ----
  const { handleTaskCreateSubmit, handleBootstrap } = useTaskCreation({
    lists,
    projectId,
    taskCreateListId,
    createList,
    createTask,
    queryClient,
    onTaskCreateClose: () => setTaskCreateOpen(false),
  });

  // ---- Keyboard shortcuts ----
  useKanbanShortcuts({
    listCount: lists.length,
    addingList,
    onBootstrap: handleBootstrap,
  });

  // ---- Add list ----
  const handleAddList = () => {
    if (!newListName.trim()) return;
    createList.mutate(
      { name: newListName.trim(), sortOrder: lists.length },
      {
        onSuccess: () => {
          setNewListName('');
          setAddingList(false);
        },
      },
    );
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
  // ---- Main render ----
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
            {isMember && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                style={{ borderRadius: 50 }}
                onClick={() => setSettingsOpen(true)}
              >
                编辑
              </Button>
            )}
          </Space>
        }
      />

      {/* Project info — metadata row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '6px 0 4px',
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
        <Tag
          style={{
            background: project.isPublic ? 'var(--tag-sage)' : 'rgba(0,0,0,0.04)',
            color: project.isPublic ? 'var(--tag-sage-text)' : 'var(--color-ink-tertiary)',
            border: 'none',
            margin: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {project.isPublic ? (
            <GlobalOutlined style={{ fontSize: 10 }} />
          ) : (
            <LockOutlined style={{ fontSize: 10 }} />
          )}
          {project.isPublic ? '公开' : '私有'}
        </Tag>
        <Tag
          color={(PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.active).color}
          style={{ margin: 0 }}
        >
          {(PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.active).label}
        </Tag>
        <Text style={{ fontSize: 12, color: 'var(--color-ink-disabled)' }}>·</Text>
        <TeamOutlined style={{ color: 'var(--color-lavender)', fontSize: 13 }} />
        <Text style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          {project.memberCount} 人
        </Text>
        <Text style={{ fontSize: 12, color: 'var(--color-ink-disabled)' }}>·</Text>
        <CalendarOutlined style={{ color: 'var(--color-ink-tertiary)', fontSize: 13 }} />
        <Text style={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
          {project.startDate || project.endDate
            ? `${project.startDate ? dayjs(project.startDate).format('YYYY/MM/DD') : '?'} — ${project.endDate ? dayjs(project.endDate).format('YYYY/MM/DD') : '?'}`
            : project.createTime
              ? dayjs(project.createTime).format('YYYY-MM-DD')
              : '—'}
        </Text>
        {project.projectUrl && (
          <>
            <Text style={{ fontSize: 12, color: 'var(--color-ink-disabled)' }}>·</Text>
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12.5,
                color: 'var(--color-sky, #5a809b)',
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: 'none',
              }}
            >
              <LinkOutlined style={{ fontSize: 11 }} />
              {new URL(project.projectUrl).hostname}
            </a>
          </>
        )}
      </div>

      {/* View controls — toolbar row */}
      {lists.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 0 14px',
          }}
        >
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as 'kanban' | 'list')}
            options={[
              { value: 'kanban', icon: <AppstoreOutlined />, label: '看板' },
              { value: 'list', icon: <UnorderedListOutlined />, label: '列表' },
            ]}
            style={{
              background: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-sm)',
            }}
          />

          <span
            style={{
              width: 1,
              height: 20,
              background: 'var(--color-border-default)',
              flexShrink: 0,
            }}
          />

          {/* Focus toggle */}
          <button
            type="button"
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? '退出专注模式' : '进入专注模式'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 28,
              padding: '0 10px',
              borderRadius: 14,
              border: 'none',
              background: focusMode ? 'var(--color-lavender-soft)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.25s ease',
            }}
          >
            <span
              style={{
                width: 28,
                height: 16,
                borderRadius: 8,
                background: focusMode ? 'var(--color-lavender)' : 'rgba(0,0,0,0.12)',
                position: 'relative',
                transition: 'background 0.3s ease',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: focusMode ? 14 : 2,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </span>
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                color: focusMode ? 'var(--color-lavender)' : 'var(--color-ink-disabled)',
                transition: 'color 0.25s ease',
                userSelect: 'none',
              }}
            >
              专注
            </Text>
          </button>
        </div>
      )}

      {/* ====== Kanban View ====== */}

      {viewMode === 'kanban' && (
        <DragDropContext
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate}
          onDragEnd={handleDragEnd}
        >
          <Droppable droppableId={BOARD_DROPPABLE} type="COLUMN" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  flex: 1,
                  display: 'flex',
                  gap: 14,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  paddingBottom: 16,
                  alignItems: orderedLists?.length ? 'stretch' : 'flex-start',
                  minHeight: 0,
                }}
              >
                {orderedLists?.map((list, ci) => (
                  <KanbanColumn
                    key={list.id}
                    list={list}
                    projectId={projectId}
                    columnIndex={ci}
                    isMember={isMember}
                    focusMode={focusMode}
                    onCardMoved={() => {}}
                    onCardClick={(cardId) => setSelectedTaskId(cardId)}
                    onTaskDeleted={(taskId) => {
                      if (taskId === selectedTaskId) setSelectedTaskId(null);
                    }}
                    onAddTask={
                      isMember
                        ? (listId) => {
                            setTaskCreateListId(listId);
                            setTaskCreateOpen(true);
                          }
                        : undefined
                    }
                  />
                ))}
                {provided.placeholder}

                {/* Add list — hidden in focus mode or view-only */}
                {!focusMode &&
                  isMember &&
                  (addingList ? (
                    <div
                      style={{
                        flex: '1 1 0',
                        minWidth: 260,
                        maxWidth: 380,
                        background: 'var(--color-bg-elevated)',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid var(--color-lavender-soft)',
                        padding: 16,
                        boxShadow: 'var(--shadow-card)',
                        animation: 'addListExpand 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
                      }}
                    >
                      <Input
                        autoFocus
                        size="small"
                        placeholder="输入列表名称，回车创建"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onPressEnter={handleAddList}
                        onBlur={() => {
                          setAddingList(false);
                          setNewListName('');
                        }}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingList(true)}
                      style={{
                        flex: '1 1 0',
                        minWidth: 160,
                        maxWidth: 380,
                        height: '100%',
                        minHeight: 120,
                        borderRadius: 'var(--radius-lg)',
                        border: '2px dashed rgba(155, 151, 212, 0.18)',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                        animation: 'addListFadeIn 0.4s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(155, 151, 212, 0.4)';
                        e.currentTarget.style.background = 'rgba(155, 151, 212, 0.03)';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(155, 151, 212, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(155, 151, 212, 0.18)';
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'rgba(155, 151, 212, 0.10)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9b97d4',
                          fontSize: 16,
                          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        <PlusOutlined />
                      </span>
                      <Text
                        style={{
                          fontSize: 13,
                          color: 'rgba(155, 151, 212, 0.5)',
                          fontWeight: 500,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        新建列表
                      </Text>
                    </button>
                  ))}

                {/* Empty state */}
                {lists.length === 0 && !addingList && <EmptyKanban onBootstrap={handleBootstrap} />}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* ====== List View ====== */}
      {viewMode === 'list' &&
        (lists.length > 0 ? (
          <TaskListView lists={lists} onTaskClick={(taskId) => setSelectedTaskId(taskId)} />
        ) : (
          <EmptyKanban onBootstrap={handleBootstrap} />
        ))}

      {/* Task create modal */}
      <TaskCreateModal
        open={taskCreateOpen}
        onClose={() => setTaskCreateOpen(false)}
        onSubmit={handleTaskCreateSubmit}
        lists={lists}
        defaultListId={taskCreateListId}
      />

      {/* Task detail drawer */}
      <Drawer
        title={taskDetail?.title ?? '加载中...'}
        open={selectedTaskId !== null}
        onClose={() => setSelectedTaskId(null)}
        width={480}
        destroyOnClose
        styles={{ body: { padding: '20px 24px' } }}
      >
        {!taskDetail && taskLoading && <Skeleton active paragraph={{ rows: 6 }} />}
        {taskDetail && <TaskDetailContent task={taskDetail} />}
        {!taskDetail && !taskLoading && (
          <Empty
            description={(taskError as Error)?.message || '未找到该任务'}
            style={{ marginTop: 40 }}
          />
        )}
      </Drawer>

      {/* Project settings modal */}
      {project && (
        <ProjectSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          projectId={project.id}
        />
      )}

      {/* Inline keyframes for add-list animations */}
      <style>{`
        @keyframes addListFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes addListExpand {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
