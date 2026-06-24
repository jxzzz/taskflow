import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Space, Tag, Spin, Typography, Input, Popconfirm, Popover,
  Select, Empty, Tooltip, Drawer, Descriptions, Skeleton,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, TeamOutlined, ClockCircleOutlined,
  PlusOutlined, DeleteOutlined, SwapOutlined, HolderOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import { useProject } from '@/hooks/useProjects';
import { useCreateTaskList, useDeleteTaskList } from '@/hooks/useTaskLists';
import { useCreateTask, useDeleteTask, useMoveTask, useTaskDetail } from '@/hooks/useTasks';
import type { TaskCardBrief, TaskListSummary } from '@/types/task';

const { Text, Title } = Typography;

/** 优先级颜色映射 */
const PRIORITY_COLORS: Record<number, string> = {
  0: 'var(--color-ink-disabled)',    // 普通 - 灰色
  1: 'var(--color-butter)',           // 紧急 - 黄色
  2: 'var(--color-coral)',            // 非常紧急 - 红色
};

const PRIORITY_LABELS: Record<number, string> = {
  0: '普通',
  1: '紧急',
  2: '非常紧急',
};

/** 单个看板列 */
function TaskColumn({
  list,
  projectId,
  allLists,
  onCardMoved,
  onCardClick,
}: {
  list: TaskListSummary;
  projectId: number;
  allLists: TaskListSummary[];
  onCardMoved: () => void;
  onCardClick: (cardId: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const moveTask = useMoveTask();
  const deleteList = useDeleteTaskList(projectId);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    createTask.mutate(
      { listId: list.id, data: { title: newTitle.trim() } },
      { onSuccess: () => { setNewTitle(''); setAdding(false); } },
    );
  };

  const targetLists = allLists.filter((l) => l.id !== list.id);

  return (
    <div style={{
      width: 280, minWidth: 280, flexShrink: 0,
      background: 'var(--color-bg-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 14px 10px',
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 240px)',
    }}>
      {/* Column header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, padding: '0 4px',
      }}>
        <Space size={6}>
          <HolderOutlined style={{ color: 'var(--color-ink-disabled)', fontSize: 13 }} />
          <Text strong style={{ fontSize: 13, color: 'var(--color-ink-primary)' }}>
            {list.name}
          </Text>
          <Tag style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 6px', border: 'none', background: 'rgba(0,0,0,0.06)', color: 'var(--color-ink-tertiary)', borderRadius: 'var(--radius-xs)' }}>
            {list.taskCount}
          </Tag>
        </Space>
        <Popconfirm
          title="删除这个列表？"
          description="列表下的所有卡片也会被删除"
          onConfirm={() => deleteList.mutate(list.id)}
          okText="删除"
          cancelText="取消"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ opacity: 0.3 }} />
        </Popconfirm>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.tasks.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            targetLists={targetLists}
            onClick={() => onCardClick(card.id)}
            onDelete={() => deleteTask.mutate(card.id)}
            onMove={(targetListId) => {
              moveTask.mutate(
                { id: card.id, data: { targetListId, sortOrder: 0 } },
                { onSuccess: onCardMoved },
              );
            }}
          />
        ))}

        {/* Inline add form */}
        {adding ? (
          <div style={{ padding: '0 2px' }}>
            <Input.TextArea
              autoFocus
              size="small"
              placeholder="输入卡片标题，回车提交"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onPressEnter={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              style={{ borderRadius: 'var(--radius-sm)', marginBottom: 6, fontSize: 12 }}
              rows={2}
            />
            <Space size={6}>
              <Button size="small" type="primary" onClick={handleAdd} loading={createTask.isPending} style={{ borderRadius: 'var(--radius-xs)', fontSize: 12 }}>
                添加
              </Button>
              <Button size="small" onClick={() => { setAdding(false); setNewTitle(''); }} style={{ borderRadius: 'var(--radius-xs)', fontSize: 12 }}>
                取消
              </Button>
            </Space>
          </div>
        ) : (
          <Button
            type="text"
            block
            icon={<PlusOutlined />}
            onClick={() => setAdding(true)}
            style={{
              color: 'var(--color-ink-tertiary)', fontSize: 12,
              borderRadius: 'var(--radius-sm)', marginTop: 2,
            }}
          >
            添加卡片
          </Button>
        )}
      </div>
    </div>
  );
}

/** 单个卡片 */
function CardItem({
  card,
  targetLists,
  onClick,
  onDelete,
  onMove,
}: {
  card: TaskCardBrief;
  targetLists: TaskListSummary[];
  onClick: () => void;
  onDelete: () => void;
  onMove: (targetListId: number) => void;
}) {
  const isOverdue = card.dueDate && dayjs(card.dueDate).isBefore(dayjs());
  const priorityColor = PRIORITY_COLORS[card.priority] || PRIORITY_COLORS[0];

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-bg-elevated)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        boxShadow: 'var(--shadow-xs)',
        border: '1px solid var(--color-border-subtle)',
        cursor: 'pointer',
        transition: 'box-shadow var(--duration-fast) var(--ease-out-expo)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
    >
      {/* Title + actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4, color: 'var(--color-ink-primary)', wordBreak: 'break-word' }}>
            {card.title}
          </div>
        </div>
        <Space size={2} style={{ flexShrink: 0 }}>
          {/* Move */}
          {targetLists.length > 0 && (
            <Popover
              trigger="click"
              content={
                <div style={{ width: 160 }}>
                  <Text style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', display: 'block', marginBottom: 6 }}>移动到</Text>
                  <Select
                    size="small"
                    style={{ width: '100%' }}
                    placeholder="选择列表"
                    options={targetLists.map((l) => ({ label: l.name, value: l.id }))}
                    onChange={(val) => onMove(val)}
                  />
                </div>
              }
            >
              <Button type="text" size="small" icon={<SwapOutlined />} style={{ fontSize: 11, opacity: 0.3 }} />
            </Popover>
          )}
          {/* Delete */}
          <Popconfirm title="删除这个卡片？" onConfirm={onDelete} okText="删除" cancelText="取消">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ fontSize: 11, opacity: 0.3 }} />
          </Popconfirm>
        </Space>
      </div>

      {/* Bottom info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        {/* Priority dot */}
        {card.priority > 0 && (
          <Tooltip title={PRIORITY_LABELS[card.priority]}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: priorityColor, display: 'inline-block', flexShrink: 0 }} />
          </Tooltip>
        )}

        {/* Due date */}
        {card.dueDate && (
          <Text style={{
            fontSize: 11, color: isOverdue ? 'var(--color-coral)' : 'var(--color-ink-tertiary)',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <ClockCircleOutlined style={{ fontSize: 10 }} />
            {dayjs(card.dueDate).format('MM/DD')}
          </Text>
        )}

        {/* Assignee */}
        {card.assigneeName && (
          <Tag style={{
            margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 5px',
            border: 'none', background: 'var(--tag-sky)', color: 'var(--tag-sky-text)',
            borderRadius: 'var(--radius-xs)',
          }}>
            {card.assigneeName}
          </Tag>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Label count */}
        {card.labelCount > 0 && (
          <Text style={{ fontSize: 10, color: 'var(--color-ink-disabled)' }}>{card.labelCount} 标签</Text>
        )}
      </div>
    </div>
  );
}

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

  if (isLoading) return <div style={{ textAlign: 'center', padding: 120 }}><Spin /></div>;
  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4} style={{ color: 'rgba(43,40,37,0.4)' }}>项目不存在</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')} style={{ marginTop: 16 }}>返回项目列表</Button>
      </div>
    );
  }

  const lists = project.lists || [];

  const handleAddList = () => {
    if (!newListName.trim()) return;
    createList.mutate(newListName.trim(), {
      onSuccess: () => { setNewListName(''); setAddingList(false); },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
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
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', marginBottom: 8,
      }}>
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
      <div style={{
        flex: 1, display: 'flex', gap: 14, overflowX: 'auto', overflowY: 'hidden',
        paddingBottom: 16, alignItems: 'flex-start',
      }}>
        {lists.map((list) => (
          <TaskColumn
            key={list.id}
            list={list}
            projectId={projectId}
            allLists={lists}
            onCardMoved={() => {}}
            onCardClick={(cardId) => setSelectedTaskId(cardId)}
          />
        ))}

        {/* Add list column */}
        {addingList ? (
          <div style={{
            width: 260, minWidth: 260, flexShrink: 0,
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
          }}>
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
              <Button size="small" type="primary" onClick={handleAddList} loading={createList.isPending} style={{ borderRadius: 'var(--radius-xs)' }}>
                添加
              </Button>
              <Button size="small" onClick={() => { setAddingList(false); setNewListName(''); }} style={{ borderRadius: 'var(--radius-xs)' }}>
                取消
              </Button>
            </Space>
          </div>
        ) : (
          <Button
            icon={<PlusOutlined />}
            onClick={() => setAddingList(true)}
            style={{
              minWidth: 200, flexShrink: 0,
              borderRadius: 'var(--radius-lg)', fontSize: 13,
              color: 'var(--color-ink-tertiary)', height: 44,
            }}
          >
            添加列表
          </Button>
        )}

        {/* Empty state */}
        {lists.length === 0 && !addingList && (
          <Empty
            description="还没有列表，点击「添加列表」开始"
            style={{ flex: 1, marginTop: 80 }}
          />
        )}
      </div>

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
                <Tag color={
                  taskDetail.priority === 2 ? 'red' :
                  taskDetail.priority === 1 ? 'orange' : 'default'
                }>
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
              <div style={{
                background: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
                fontSize: 13,
                lineHeight: 1.7,
                color: 'var(--color-ink-primary)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
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
            <div style={{ marginTop: 24, padding: '12px 0', borderTop: '1px solid var(--color-border-subtle)' }}>
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
