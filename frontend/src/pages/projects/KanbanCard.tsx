import { Space, Tag, Typography, Button, Popconfirm, Popover, Select, Tooltip } from 'antd';
import { SwapOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';
import type { TaskCardBrief, TaskListSummary } from '@/types/task';

const { Text } = Typography;

/** 优先级颜色映射 */
export const PRIORITY_COLORS: Record<number, string> = {
  0: 'var(--color-ink-disabled)',
  1: 'var(--color-butter)',
  2: 'var(--color-coral)',
};

export const PRIORITY_LABELS: Record<number, string> = {
  0: '普通',
  1: '紧急',
  2: '非常紧急',
};

interface KanbanCardProps {
  card: TaskCardBrief;
  listId: number;
  targetLists: TaskListSummary[];
  onClick: () => void;
  onDelete: () => void;
  onMove: (targetListId: number) => void;
  /** When true, renders as a drag overlay (elevated, non-interactive) */
  isOverlay?: boolean;
}

export default function KanbanCard({
  card,
  listId,
  targetLists,
  onClick,
  onDelete,
  onMove,
  isOverlay = false,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card' as const, card, listId },
    disabled: isOverlay,
  });

  const isOverdue = card.dueDate && dayjs(card.dueDate).isBefore(dayjs());
  const priorityColor = PRIORITY_COLORS[card.priority] || PRIORITY_COLORS[0];

  const style: React.CSSProperties = {
    background: 'var(--color-bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    boxShadow: isOverlay ? 'var(--shadow-elevated)' : isDragging ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
    border: '1px solid var(--color-border-subtle)',
    cursor: isOverlay ? 'grabbing' : isDragging ? 'grabbing' : 'grab',
    transition: transition ?? 'box-shadow var(--duration-fast) var(--ease-out-expo)',
    opacity: isDragging ? 0.4 : isOverlay ? 0.95 : 1,
    transform: CSS.Transform.toString(transform),
    pointerEvents: isOverlay ? 'none' : 'auto',
    position: 'relative',
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={isOverlay ? undefined : isDragging ? undefined : onClick}
      onMouseEnter={isOverlay ? undefined : isDragging ? undefined : (e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={isOverlay ? undefined : (e) => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
    >

      {/* Title + actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4, color: 'var(--color-ink-primary)', wordBreak: 'break-word' }}>
            {card.title}
          </div>
        </div>
        {!isOverlay && (
          <Space size={2} style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
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
        )}
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
