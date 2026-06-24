import { useState, useCallback } from 'react';
import { Space, Tag, Typography, Button, Popconfirm, Popover, Select, Tooltip, Progress, App } from 'antd';
import {
  SwapOutlined, DeleteOutlined, ClockCircleOutlined, CheckSquareOutlined,
  MessageOutlined, AlignLeftOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';
import { useCreateChecklistItem, useToggleChecklistItem, useDeleteChecklistItem } from '@/hooks/useChecklist';
import type { TaskCardBrief, TaskListSummary, ChecklistItem } from '@/types/task';

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

  const isOverdue = card.isOverdue ?? (card.dueDate && dayjs(card.dueDate).isBefore(dayjs()));
  const priorityColor = PRIORITY_COLORS[card.priority] || PRIORITY_COLORS[0];
  const hasCover = !!card.coverColor;
  const hasChecklist = card.checklistCount > 0;
  const checklistPct = hasChecklist
    ? Math.round((card.completedChecklistCount / card.checklistCount) * 100)
    : 0;
  const checklistItems = card.checklistItems ?? [];

  // Inline add checklist item
  const [addingItem, setAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const createItem = useCreateChecklistItem(card.id);
  const toggleItem = useToggleChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const { message } = App.useApp();

  const handleAddItem = useCallback(() => {
    if (!newItemTitle.trim()) return;
    createItem.mutate(newItemTitle.trim(), {
      onSuccess: () => { setNewItemTitle(''); setAddingItem(false); },
    });
  }, [newItemTitle, createItem]);

  const handleToggle = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    toggleItem.mutate(id);
  }, [toggleItem]);

  const handleDeleteItem = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteItem.mutate(id);
  }, [deleteItem]);

  const style: React.CSSProperties = {
    background: 'var(--color-bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: isOverlay ? 'var(--shadow-elevated)' : isDragging ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
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
      style={style}
      {...attributes}
      {...listeners}
      onClick={isOverlay ? undefined : isDragging ? undefined : onClick}
      onMouseEnter={isOverlay ? undefined : isDragging ? undefined : (e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={isOverlay ? undefined : (e) => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
    >
      {/* Cover color strip */}
      {hasCover && (
        <div style={{ height: 3, background: card.coverColor, flexShrink: 0 }} />
      )}

      <div style={{ padding: '10px 12px' }}>
        {/* Title + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 500, fontSize: 13, lineHeight: 1.4,
              color: 'var(--color-ink-primary)', wordBreak: 'break-word',
            }}>
              {card.title}
            </div>
          </div>
          {!isOverlay && (
            <Space size={2} style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
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
              <Popconfirm title="删除这个卡片？" onConfirm={onDelete} okText="删除" cancelText="取消">
                <Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ fontSize: 11, opacity: 0.3 }} />
              </Popconfirm>
            </Space>
          )}
        </div>

        {/* Content snippet */}
        {card.contentSnippet && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 6 }}>
            <AlignLeftOutlined style={{ fontSize: 10, color: 'var(--color-ink-disabled)', marginTop: 2, flexShrink: 0 }} />
            <Text style={{
              fontSize: 11, lineHeight: 1.45, color: 'var(--color-ink-tertiary)',
              wordBreak: 'break-word', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {card.contentSnippet}
            </Text>
          </div>
        )}

        {/* ====== Checklist Section ====== */}
        {!isOverlay && (
          <div
            style={{ marginTop: 10, userSelect: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            {hasChecklist && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <CheckSquareOutlined style={{
                  fontSize: 11,
                  color: checklistPct === 100 ? 'var(--color-mint)' : 'var(--color-ink-disabled)',
                }} />
                <Progress
                  percent={checklistPct}
                  size="small"
                  strokeColor={checklistPct === 100 ? 'var(--color-mint)' : 'var(--color-lavender)'}
                  trailColor="rgba(0,0,0,0.06)"
                  showInfo={false}
                  style={{ flex: 1, margin: 0, lineHeight: 1 }}
                />
                <Text style={{ fontSize: 10, color: 'var(--color-ink-tertiary)', flexShrink: 0, fontWeight: 500 }}>
                  {card.completedChecklistCount}/{card.checklistCount}
                </Text>
              </div>
            )}

            {/* Checklist items */}
            {checklistItems.map((item) => (
              <ChecklistRow
                key={item.id}
                item={item}
                onToggle={(e) => handleToggle(e, item.id)}
                onDelete={(e) => handleDeleteItem(e, item.id)}
              />
            ))}

            {/* "+N more" indicator */}
            {card.checklistCount > checklistItems.length && (
              <Text style={{
                fontSize: 10, color: 'var(--color-ink-disabled)',
                paddingLeft: 22, display: 'block', marginBottom: 2,
              }}>
                +{card.checklistCount - checklistItems.length} 项...
              </Text>
            )}

            {/* Inline add form */}
            {addingItem ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 0, marginTop: 4 }}>
                <input
                  autoFocus
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); }
                    if (e.key === 'Escape') { setAddingItem(false); setNewItemTitle(''); }
                  }}
                  placeholder="检查项..."
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    background: 'transparent', color: '#c8c4d8',
                    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    padding: '3px 0', borderBottom: '1px solid rgba(247,200,108,0.4)',
                    caretColor: '#f7c86c',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!newItemTitle.trim()}
                  style={{
                    padding: '2px 10px', borderRadius: 9999, border: 'none',
                    background: newItemTitle.trim() ? 'var(--color-lavender)' : 'rgba(0,0,0,0.06)',
                    color: newItemTitle.trim() ? '#fff' : 'var(--color-ink-disabled)',
                    fontSize: 11, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                    cursor: newItemTitle.trim() ? 'pointer' : 'default',
                  }}
                >
                  确定
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingItem(false); setNewItemTitle(''); }}
                  style={{
                    padding: '2px 8px', borderRadius: 9999, border: 'none',
                    background: 'transparent', color: 'var(--color-ink-disabled)',
                    fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  }}
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingItem(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '2px 0', marginTop: 2,
                  border: 'none', background: 'transparent',
                  color: 'var(--color-ink-disabled)', fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink-secondary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-disabled)'; }}
              >
                <PlusOutlined style={{ fontSize: 10 }} />
                添加子任务
              </button>
            )}
          </div>
        )}

        {/* Bottom info row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: (hasChecklist || card.contentSnippet) ? 8 : 8,
          flexWrap: 'wrap',
        }}>
          {card.priority > 0 && (
            <Tooltip title={PRIORITY_LABELS[card.priority]}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '1px 6px', borderRadius: 9999,
                background: card.priority === 2 ? 'rgba(232,96,96,0.1)' : 'rgba(240,180,80,0.1)',
                fontSize: 10, fontWeight: 500, color: priorityColor,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: priorityColor, display: 'inline-block' }} />
                {PRIORITY_LABELS[card.priority]}
              </span>
            </Tooltip>
          )}

          {card.dueDate && (
            <Text style={{
              fontSize: 11, color: isOverdue ? 'var(--color-coral)' : 'var(--color-ink-tertiary)',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <ClockCircleOutlined style={{ fontSize: 10 }} />
              {dayjs(card.dueDate).format('MM/DD')}
            </Text>
          )}

          <div style={{ flex: 1 }} />

          {card.commentCount > 0 && (
            <Text style={{ fontSize: 10, color: 'var(--color-ink-disabled)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <MessageOutlined style={{ fontSize: 10 }} />
              {card.commentCount}
            </Text>
          )}

          {card.labelCount > 0 && (
            <Text style={{ fontSize: 10, color: 'var(--color-ink-disabled)' }}>{card.labelCount} 标签</Text>
          )}
        </div>
      </div>
    </div>
  );
}

/** Single checklist item row */
function ChecklistRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ChecklistItem;
  onToggle: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const [hover, setHover] = useState(false);
  const done = item.completed;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '2px 0',
        opacity: done ? 0.5 : 1,
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Circle toggle */}
      <span
        onClick={onToggle}
        style={{
          width: 16, height: 16, borderRadius: '50%',
          border: done
            ? '2px solid var(--color-mint)'
            : '2px solid var(--color-ink-disabled)',
          background: done ? 'var(--color-mint)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: done ? 'scale(1)' : 'scale(0.92)',
        }}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      {/* Title */}
      <span style={{
        flex: 1, fontSize: 12, lineHeight: 1.5,
        color: done ? 'var(--color-ink-disabled)' : 'var(--color-ink-primary)',
        textDecoration: done ? 'line-through' : 'none',
        transition: 'color 0.2s ease',
        wordBreak: 'break-word',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {item.title}
      </span>

      {/* Delete (on hover) */}
      {hover && (
        <button
          type="button"
          onClick={onDelete}
          style={{
            border: 'none', background: 'transparent',
            color: 'var(--color-coral)', fontSize: 12, cursor: 'pointer',
            padding: 0, lineHeight: 1, opacity: 0.6,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
