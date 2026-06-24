import { Space, Button, Popconfirm, Popover, Select } from 'antd';
import {
  SwapOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';
import type { TaskCardBrief, TaskListSummary } from '@/types/task';

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' as const, card, listId },
    disabled: isOverlay,
  });

  const isOverdue = card.isOverdue ?? (card.dueDate && dayjs(card.dueDate).isBefore(dayjs()));
  const priorityColor = PRIORITY_COLORS[card.priority] || PRIORITY_COLORS[0];
  const hasCover = !!card.coverColor;
  const checklistCount = card.checklistCount ?? 0;
  const completedCount = card.completedChecklistCount ?? 0;
  const hasChecklist = checklistCount > 0;
  const checklistPct = hasChecklist ? Math.round((completedCount / checklistCount) * 100) : 0;

  const style: React.CSSProperties = {
    background: 'var(--color-bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: isOverlay
      ? 'var(--shadow-elevated)'
      : isDragging
        ? 'var(--shadow-sm)'
        : 'var(--shadow-xs)',
    border: '1px solid var(--color-border-subtle)',
    cursor: isOverlay ? 'grabbing' : isDragging ? 'grabbing' : 'grab',
    transition: transition ?? 'box-shadow var(--duration-fast) var(--ease-out-expo)',
    opacity: isDragging ? 0.4 : isOverlay ? 0.95 : 1,
    transform: CSS.Transform.toString(transform),
    pointerEvents: isOverlay ? 'none' : 'auto',
    position: 'relative',
    touchAction: 'none',
    overflow: 'hidden',
  };

  return (
    <div
      ref={setNodeRef}
      className="kanban-card"
      style={style}
      {...attributes}
      {...listeners}
      onClick={isOverlay ? undefined : isDragging ? undefined : onClick}
      onMouseEnter={
        isOverlay
          ? undefined
          : isDragging
            ? undefined
            : (e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }
      }
      onMouseLeave={
        isOverlay
          ? undefined
          : (e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
            }
      }
    >
      {/* Cover color strip */}
      {hasCover && <div style={{ height: 3, background: card.coverColor, flexShrink: 0 }} />}

      <div style={{ padding: '12px 14px' }}>
        {/* Title */}
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            lineHeight: 1.35,
            color: 'var(--color-ink-primary)',
            wordBreak: 'break-word',
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: '-0.01em',
            marginBottom: card.contentSnippet || hasChecklist ? 6 : 8,
          }}
        >
          {card.title}
        </div>

        {/* Content snippet */}
        {card.contentSnippet && (
          <div
            style={{
              fontSize: 11.5,
              lineHeight: 1.45,
              color: 'var(--color-ink-tertiary)',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: hasChecklist ? 8 : 8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {card.contentSnippet}
          </div>
        )}

        {/* Checklist Progress */}
        {hasChecklist && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <CheckSquareOutlined
                style={{
                  fontSize: 10,
                  color: checklistPct === 100 ? '#9bbc9e' : 'rgba(43,40,37,0.18)',
                }}
              />
              <span
                style={{
                  fontSize: 10.5,
                  color: 'var(--color-ink-tertiary)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                }}
              >
                {completedCount}/{checklistCount}
              </span>
            </div>
            {/* Custom progress track */}
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: 'rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 2,
                  width: `${checklistPct}%`,
                  background: checklistPct === 100 ? '#9bbc9e' : '#9b97d4',
                  transition: 'width 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                  minWidth: checklistPct > 0 ? 4 : 0,
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom row: priority + due date + actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {card.priority > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '1px 6px',
                  borderRadius: 9999,
                  background: card.priority === 2 ? 'rgba(232,96,96,0.08)' : 'rgba(224,184,80,0.1)',
                  fontSize: 10,
                  fontWeight: 500,
                  color: priorityColor,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span
                  style={{ width: 5, height: 5, borderRadius: '50%', background: priorityColor }}
                />
                {PRIORITY_LABELS[card.priority]}
              </span>
            )}
            {card.dueDate && (
              <span
                style={{
                  fontSize: 10.5,
                  color: isOverdue ? 'var(--color-coral)' : 'var(--color-ink-tertiary)',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 10 }} />
                {dayjs(card.dueDate).format('MM/DD')}
              </span>
            )}
          </div>

          {/* Action buttons — only on hover */}
          {!isOverlay && (
            <Space
              size={0}
              onClick={(e) => e.stopPropagation()}
              style={{ flexShrink: 0, opacity: 0, transition: 'opacity 0.15s ease' }}
              className="card-actions"
            >
              {targetLists.length > 0 && (
                <Popover
                  trigger="click"
                  content={
                    <div style={{ width: 150 }}>
                      <Select
                        size="small"
                        style={{ width: '100%' }}
                        placeholder="移动到"
                        options={targetLists.map((l) => ({ label: l.name, value: l.id }))}
                        onChange={(val) => onMove(val)}
                      />
                    </div>
                  }
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<SwapOutlined />}
                    style={{ fontSize: 11, color: 'var(--color-ink-disabled)' }}
                  />
                </Popover>
              )}
              <Popconfirm title="删除？" onConfirm={onDelete} okText="删除" cancelText="取消">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  style={{ fontSize: 11 }}
                />
              </Popconfirm>
            </Space>
          )}
        </div>

        <style>{`
          .kanban-card .card-actions { opacity: 0; }
          .kanban-card:hover .card-actions { opacity: 1 !important; }
        `}</style>
      </div>
    </div>
  );
}
