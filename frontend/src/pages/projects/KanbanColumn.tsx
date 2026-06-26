import { App, Button, Tag, Typography, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  HolderOutlined,
  MoreOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import KanbanCard from '@/pages/projects/KanbanCard';
import { useDeleteTask, useMoveTask } from '@/hooks/useTasks';
import { useDeleteTaskList } from '@/hooks/useTaskLists';
import { makeCardId, makeColId } from '@/pages/projects/useKanbanDrag';
import type { TaskListSummary } from '@/types/task';

const { Text } = Typography;

interface KanbanColumnProps {
  list: TaskListSummary;
  projectId: number;
  columnIndex: number;
  allLists: TaskListSummary[];
  onCardMoved: () => void;
  onCardClick: (cardId: number) => void;
  onTaskDeleted?: (taskId: number) => void;
  onAddTask?: (listId: number) => void;
  /** When true, hides all edit/delete controls for non-member viewers */
  readOnly?: boolean;
  /** Whether the current user can drag (member of the project) */
  isMember?: boolean;
  /** Focus mode disables column reorder but keeps card DnD */
  focusMode?: boolean;
}

export default function KanbanColumn({
  list,
  projectId,
  columnIndex,
  allLists,
  onCardMoved,
  onCardClick,
  onTaskDeleted,
  onAddTask,
  readOnly = false,
  isMember = true,
  focusMode = false,
}: KanbanColumnProps) {
  const deleteTask = useDeleteTask();
  const moveTask = useMoveTask();
  const deleteList = useDeleteTaskList(projectId);
  const { modal } = App.useApp();

  const targetLists = allLists.filter((l) => l.id !== list.id);
  const isEmpty = list.tasks.length === 0;

  // ---- More menu ----
  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'rename',
      icon: <EditOutlined />,
      label: '重命名',
    },
    ...(readOnly ? [] : [{ type: 'divider' as const }]),
    ...(readOnly
      ? []
      : [
          {
            key: 'delete' as const,
            icon: <DeleteOutlined />,
            label: '删除列表',
            danger: true,
          },
        ]),
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

  // ---- Card list area (with or without DnD) ----
  const cardListDroppableId = `list-${list.id}`;

  const renderCardList = () => {
    // Shared card list styles
    const listStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minHeight: isEmpty ? 80 : 0,
      borderRadius: 'var(--radius-sm)',
      transition: 'background 0.2s ease, border 0.2s ease',
    };

    // Non-member: plain cards, no DnD
    if (!isMember) {
      return (
        <div style={{ ...listStyle, border: '2px dashed transparent' }}>
          {list.tasks.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              index={0}
              listId={list.id}
              targetLists={targetLists}
              readOnly={readOnly}
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
              拖拽卡片到此处
            </div>
          )}
        </div>
      );
    }

    // Member: Droppable + Draggable cards
    return (
      <Droppable droppableId={cardListDroppableId} type="CARD" direction="vertical">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              ...listStyle,
              background: snapshot.isDraggingOver ? 'rgba(155, 151, 212, 0.06)' : 'transparent',
              border:
                snapshot.isDraggingOver && isEmpty
                  ? '2px dashed rgba(155, 151, 212, 0.25)'
                  : '2px dashed transparent',
            }}
          >
            {list.tasks.map((card, i) => (
              <Draggable key={card.id} draggableId={makeCardId(card.id)} index={i}>
                {(provided, cardSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <KanbanCard
                      card={card}
                      index={i}
                      listId={list.id}
                      targetLists={targetLists}
                      isDragging={cardSnapshot.isDragging}
                      readOnly={readOnly}
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
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
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
                {snapshot.isDraggingOver ? '松开放置卡片' : '拖拽卡片到此处'}
              </div>
            )}
          </div>
        )}
      </Droppable>
    );
  };

  // ---- Column content (shared across all modes) ----
  const renderColumnContent = (
    dragHandleProps?: Record<string, unknown> | null,
    isColumnDragging?: boolean,
  ) => (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 260,
        maxWidth: 380,
        background: '#f5faf6',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px 10px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        opacity: isColumnDragging ? 0.5 : 1,
        border: '1px solid rgba(155, 188, 158, 0.2)',
        height: '100%',
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          padding: '0 2px',
        }}
      >
        {/* Left: grip + title + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <span
            {...dragHandleProps}
            style={{
              cursor: isColumnDragging ? 'grabbing' : 'grab',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
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
          <Tag
            style={{
              margin: 0,
              fontSize: 10,
              lineHeight: '16px',
              padding: '0 5px',
              border: 'none',
              background: 'rgba(0,0,0,0.07)',
              color: 'var(--color-ink-tertiary)',
              borderRadius: 'var(--radius-xs)',
              flexShrink: 0,
            }}
          >
            {list.taskCount}
          </Tag>
        </div>

        {/* Right: + and ··· */}
        {!readOnly && (
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

      {/* Card list */}
      {renderCardList()}
    </div>
  );

  // ---- Render without column Draggable (non-member or focus mode) ----
  if (!isMember || focusMode) {
    return renderColumnContent();
  }

  // ---- Normal mode: column is draggable ----
  return (
    <Draggable draggableId={makeColId(list.id)} index={columnIndex}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          {renderColumnContent(provided.dragHandleProps, snapshot.isDragging)}
        </div>
      )}
    </Draggable>
  );
}
