import { useState, useEffect, useRef } from 'react';
import { Button, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useCreateChecklistItem,
  useToggleChecklistItem,
  useDeleteChecklistItem,
} from '@/hooks/useChecklist';
import type { TaskDetail } from '@/types/task';

const pillBase: React.CSSProperties = {
  padding: '2px 10px',
  borderRadius: 9999,
  fontSize: 11,
  fontWeight: 500,
  fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
  letterSpacing: '0.01em',
  border: 'none',
};

export default function TaskDetailContent({ task }: { task: TaskDetail }) {
  const createItem = useCreateChecklistItem(task.id);
  const toggleItem = useToggleChecklistItem(task.id);
  const deleteItem = useDeleteChecklistItem(task.id);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = task.checklistItems || [];
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const contentLines = (task.content || '').split('\n').filter((l) => l.trim() !== '');
  const canGenerate = contentLines.length > 0 && totalCount === 0;

  // Focus input when ghost row appears
  useEffect(() => {
    if (adding) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [adding]);

  function commit() {
    const text = newTitle.trim();
    if (!text) { cancelAdd(); return; }
    createItem.mutate(text, {
      onSuccess: () => { setNewTitle(''); inputRef.current?.focus(); },
    });
  }

  function cancelAdd() {
    setAdding(false);
    setNewTitle('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancelAdd(); }
  }

  const ink = { primary: 'var(--color-ink-primary)', secondary: 'var(--color-ink-secondary)', tertiary: 'var(--color-ink-tertiary)', disabled: 'var(--color-ink-disabled)' };

  return (
    <div>
      {/* Meta row — pastel pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <span style={{
          ...pillBase,
          background: task.priority === 2 ? 'var(--color-coral-soft)' : task.priority === 1 ? 'var(--color-butter-soft)' : 'rgba(0,0,0,0.04)',
          color: task.priority === 2 ? 'var(--color-coral)' : task.priority === 1 ? 'var(--color-butter)' : ink.tertiary,
        }}>
          {task.priorityLabel}
        </span>
        <span style={{ ...pillBase, background: 'var(--color-lavender-soft)', color: 'var(--color-ink-secondary)' }}>
          {task.listName}
        </span>
        {task.dueDate && (
          <span style={{
            ...pillBase,
            background: task.isOverdue ? 'var(--color-coral-soft)' : 'rgba(0,0,0,0.04)',
            color: task.isOverdue ? 'var(--color-coral)' : ink.secondary,
          }}>
            {task.isOverdue ? '⚠ ' : ''}{dayjs(task.dueDate).format('MM/DD HH:mm')}
          </span>
        )}
        {task.assigneeName && (
          <span style={{ ...pillBase, background: 'var(--color-sky-soft)', color: 'var(--color-lavender)' }}>
            {task.assigneeName}
          </span>
        )}
      </div>

      {/* Checklist section */}
      <div style={{ marginTop: 6 }}>
        {/* Header + count */}
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: totalCount > 0 ? 8 : 0,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: ink.disabled,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
          }}>
            检查项
          </span>
          {totalCount > 0 && (
            <span style={{ fontSize: 11, color: ink.tertiary, fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif" }}>
              {completedCount}/{totalCount}
            </span>
          )}
        </div>

        {/* Progress track */}
        {totalCount > 0 && (
          <div style={{
            height: 3, borderRadius: 2, marginBottom: 14,
            background: 'rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${pct}%`,
              background: pct === 100
                ? 'linear-gradient(90deg, var(--color-ink-primary), var(--color-sage))'
                : 'var(--color-ink-primary)',
              transition: 'width 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
            }} />
          </div>
        )}

        {/* Checklist items from DB */}
        {items.map((item) => (
          <div
            key={item.id}
            className="checklist-item"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 10px 8px 4px',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              userSelect: 'none',
            }}
            onClick={() => toggleItem.mutate(item.id)}
          >
            <Checkbox checked={item.completed} style={{ marginTop: 2, pointerEvents: 'none' }} />
            <span style={{
              flex: 1, fontSize: 14, lineHeight: 1.55,
              color: item.completed ? ink.disabled : ink.primary,
              textDecoration: item.completed ? 'line-through' : 'none',
              textDecorationColor: 'rgba(0,0,0,0.15)',
              transition: 'color 0.25s ease',
              wordBreak: 'break-word',
              fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
            }}>
              {item.title}
            </span>
            <button
              type="button"
              className="checklist-delete-btn"
              onClick={(e) => { e.stopPropagation(); deleteItem.mutate(item.id); }}
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: 'transparent', padding: '2px 4px', borderRadius: 4,
                fontSize: 12, lineHeight: 1, transition: 'color 0.15s',
              }}
            >
              ×
            </button>
          </div>
        ))}

        {/* Ghost row — inline add */}
        {adding ? (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '8px 10px 8px 4px',
            borderRadius: 8,
            background: 'rgba(23,23,28,0.04)',
            border: '1px solid rgba(23,23,28,0.10)',
          }}>
            <span style={{
              width: 16, height: 16, marginTop: 3, flexShrink: 0,
              borderRadius: 3, border: '2px solid rgba(23,23,28,0.15)',
              background: 'rgba(23,23,28,0.04)',
            }} />
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => { if (!newTitle.trim()) cancelAdd(); }}
              placeholder="输入检查项，Enter 添加，Esc 取消"
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent',
                fontSize: 14, lineHeight: 1.55,
                color: ink.primary,
                fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                caretColor: 'var(--color-ink-primary)',
                padding: 0,
              }}
            />
            <span style={{
              fontSize: 10, color: 'rgba(23,23,28,0.22)',
              fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
              background: 'rgba(23,23,28,0.06)',
              padding: '1px 6px', borderRadius: 4,
              marginTop: 2, flexShrink: 0,
              letterSpacing: '0.03em',
            }}>
              ↵
            </span>
          </div>
        ) : (
          /* "+" trigger row */
          <div
            className="checklist-add-row"
            onClick={() => setAdding(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px 8px 4px',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.15s ease, border-color 0.15s ease',
              border: '1px solid transparent',
              userSelect: 'none',
            }}
          >
            <span style={{
              width: 16, height: 16, flexShrink: 0, marginTop: 3,
              borderRadius: 3, border: '1.5px dashed rgba(23,23,28,0.15)',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.15s ease, background 0.15s ease',
            }}>
              <PlusOutlined style={{ fontSize: 9, color: 'rgba(23,23,28,0.2)' }} />
            </span>
            <span style={{
              flex: 1, fontSize: 13.5, lineHeight: 1.55,
              color: ink.disabled,
              fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
              fontStyle: 'italic',
            }}>
              添加检查项
            </span>
          </div>
        )}

        {/* Empty state */}
        {totalCount === 0 && !adding && (
          <>
            {canGenerate ? (
              <div style={{
                padding: '20px 16px', textAlign: 'center',
                borderRadius: 10, border: '1px dashed rgba(0,0,0,0.08)',
                background: 'rgba(0,0,0,0.015)',
                marginTop: 8,
              }}>
                <div style={{ fontSize: 13, color: ink.tertiary, marginBottom: 10, fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif" }}>
                  描述中有 {contentLines.length} 行内容
                </div>
                <Button
                  size="small"
                  type="default"
                  onClick={() => contentLines.forEach((line) => createItem.mutate(line))}
                  loading={createItem.isPending}
                  style={{ borderRadius: 9999 }}
                >
                  从描述生成检查项
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Task content (plain text, if any) */}
      {task.content && (
        <div style={{ marginTop: 24 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: ink.disabled,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
          }}>
            描述
          </span>
          <div style={{
            marginTop: 6, padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(0,0,0,0.02)',
            border: '1px solid rgba(0,0,0,0.05)',
            fontSize: 13.5, lineHeight: 1.7,
            color: ink.secondary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
          }}>
            {task.content}
          </div>
        </div>
      )}

      {/* Footer — subtle metadata */}
      <div style={{
        marginTop: 28, paddingTop: 14,
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', gap: 32,
      }}>
        <div>
          <div style={{ fontSize: 9, color: ink.disabled, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            Created
          </div>
          <div style={{ fontSize: 11, color: ink.tertiary, fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif" }}>
            {dayjs(task.createTime).format('YYYY/MM/DD HH:mm')}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: ink.disabled, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            Updated
          </div>
          <div style={{ fontSize: 11, color: ink.tertiary, fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif" }}>
            {dayjs(task.updateTime).format('YYYY/MM/DD HH:mm')}
          </div>
        </div>
      </div>
      <style>{`
        .checklist-item:hover { background: rgba(23,23,28,0.06); }
        .checklist-delete-btn:hover { color: rgba(0,0,0,0.2) !important; }
        .checklist-add-row:hover { background: rgba(23,23,28,0.04); border-color: rgba(23,23,28,0.08); }
      `}</style>
    </div>
  );
}
