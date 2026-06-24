import { useMemo } from 'react';
import { App, Button, Tag, Typography, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, DeleteOutlined, HolderOutlined, MoreOutlined, EditOutlined } from '@ant-design/icons';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import KanbanCard from '@/pages/projects/KanbanCard';
import { useDeleteTask, useMoveTask } from '@/hooks/useTasks';
import { useDeleteTaskList } from '@/hooks/useTaskLists';
import type { TaskListSummary } from '@/types/task';

const { Text } = Typography;

interface KanbanColumnProps {
  list: TaskListSummary;
  projectId: number;
  allLists: TaskListSummary[];
  onCardMoved: () => void;
  onCardClick: (cardId: number) => void;
  onTaskDeleted?: (taskId: number) => void;
  onAddTask?: (listId: number) => void;
  /** When true, renders as a drag overlay (simplified, non-interactive) */
  isOverlay?: boolean;
}

export default function KanbanColumn({
  list,
  projectId,
  allLists,
  onCardMoved,
  onCardClick,
  onTaskDeleted,
  onAddTask,
  isOverlay = false,
}: KanbanColumnProps) {
  const deleteTask = useDeleteTask();
  const moveTask = useMoveTask();
  const deleteList = useDeleteTaskList(projectId);
  const { modal } = App.useApp();

  // Column-level sortable (drag to reorder columns)
  const {
    attributes,
    listeners,
    setNodeRef: setColumnRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: `list-${list.id}`,
    data: { type: 'column' as const, list },
    disabled: isOverlay,
  });

  // Column as drop target (for cards dropped on empty columns / column body)
  const { setNodeRef: setDropRef, isOver: isDropOver } = useDroppable({
    id: `drop-list-${list.id}`,
    data: { type: 'column' as const, list },
  });

  const targetLists = allLists.filter((l) => l.id !== list.id);
  const cardIds = useMemo(() => list.tasks.map((t) => t.id), [list.tasks]);
  const isEmpty = list.tasks.length === 0;

  const columnStyle: React.CSSProperties = {
    width: 296,
    minWidth: 296,
    flexShrink: 0,
    background: '#f5faf6',
    borderRadius: 'var(--radius-lg)',
    padding: '12px 14px 10px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    opacity: isColumnDragging ? 0.5 : isOverlay ? 0.92 : 1,
    boxShadow: isOverlay ? 'var(--shadow-elevated)' : 'none',
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    position: 'relative' as const,
    border: '1px solid rgba(155, 188, 158, 0.2)',
  };

  // ··· dropdown menu items
  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'rename',
      icon: <EditOutlined />,
      label: '重命名',
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除列表',
      danger: true,
    },
  ];

  const handleMoreMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'delete') {
      modal.confirm({
        title: '删除这个列表？',
        content: '列表下的所有卡片也会被删除',
        okText: '删除',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: () => deleteList.mutateAsync(list.id),
      });
    }
    if (key === 'rename') {
      // TODO: inline rename
    }
  };

  return (
    <div ref={setColumnRef} style={columnStyle} {...attributes}>
      {/* Column header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, padding: '0 2px',
      }}>
        {/* Left: grip + title + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <span
            ref={setActivatorNodeRef}
            {...listeners}
            style={{ cursor: 'grab', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <HolderOutlined style={{ color: 'var(--color-ink-disabled)', fontSize: 12 }} />
          </span>
          <Text
            strong
            style={{
              fontSize: 13.5,
              color: 'var(--color-ink-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {list.name}
          </Text>
          <Tag style={{
            margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 5px',
            border: 'none', background: 'rgba(0,0,0,0.07)', color: 'var(--color-ink-tertiary)',
            borderRadius: 'var(--radius-xs)', flexShrink: 0,
          }}>
            {list.taskCount}
          </Tag>
        </div>

        {/* Right: + and ··· */}
        {!isOverlay && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onAddTask?.(list.id)}
              style={{ fontSize: 14, color: 'var(--color-ink-secondary)', borderRadius: 6 }}
            />
            <Dropdown
              menu={{ items: moreMenuItems, onClick: handleMoreMenuClick }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                style={{ fontSize: 14, color: 'var(--color-ink-secondary)', borderRadius: 6 }}
              />
            </Dropdown>
          </div>
        )}
      </div>

      {/* Cards area — also serves as drop target */}
      <div
        ref={setDropRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minHeight: isEmpty ? 60 : 0,
          borderRadius: 'var(--radius-sm)',
          background: isDropOver ? 'rgba(155, 151, 212, 0.06)' : 'transparent',
          border: isDropOver && isEmpty ? '2px dashed rgba(155, 151, 212, 0.25)' : '2px dashed transparent',
          transition: 'background 0.2s ease, border 0.2s ease',
        }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.tasks.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              listId={list.id}
              targetLists={targetLists}
              onClick={() => onCardClick(card.id)}
              onDelete={() => {
                deleteTask.mutate(card.id, {
                  onSuccess: () => onTaskDeleted?.(card.id),
                });
              }}
              onMove={(targetListId) => {
                moveTask.mutate(
                  { id: card.id, data: { targetListId, sortOrder: 0 } },
                  { onSuccess: onCardMoved },
                );
              }}
            />
          ))}
        </SortableContext>

        {/* Empty column drop hint */}
        {isEmpty && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ink-disabled)',
              fontSize: 12,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {isDropOver ? '松开放置卡片' : '拖拽卡片到此处'}
          </div>
        )}
      </div>
    </div>
  );
}
