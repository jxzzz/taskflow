import { useState, useRef, useEffect, useCallback } from 'react';
import { Typography, DatePicker, Checkbox, App } from 'antd';
import {
  CalendarOutlined,
  FlagOutlined,
  ThunderboltOutlined,
  AlignLeftOutlined,
  FontSizeOutlined,
  CheckSquareOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { TaskListSummary } from '@/types/task';

const { Text } = Typography;

const PRIORITY_OPTIONS = [
  { value: 0, label: '普通', color: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.05)' },
  { value: 1, label: '紧急', color: '#f0c860', bg: 'rgba(240,180,80,0.12)' },
  { value: 2, label: '非常紧急', color: '#f09090', bg: 'rgba(232,96,96,0.12)' },
];

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content?: string;
    priority?: number;
    dueDate?: string;
    checklistItems?: string[];
  }) => void;
  lists: TaskListSummary[];
  defaultListId?: number;
}

export default function TaskCreateModal({
  open,
  onClose,
  onSubmit,
  lists,
  defaultListId,
}: TaskCreateModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState(0);
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);
  const [dueTime, setDueTime] = useState<Dayjs | null>(null);
  const [selectedListId, setSelectedListId] = useState<number | null>(
    defaultListId || (lists[0]?.id ?? null)
  );
  const [checklistItems, setChecklistItems] = useState<{ title: string; completed: boolean }[]>([]);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { message } = App.useApp();

  // Entrance / exit animation
  useEffect(() => {
    if (open) {
      setTitle('');
      setContent('');
      setPriority(0);
      setDueDate(null);
      setDueTime(null);
      setSelectedListId(defaultListId || lists[0]?.id || null);
      setChecklistItems([]);
      setNewCheckItem('');
      setIsSubmitting(false);
      const t = setTimeout(() => setMounted(true), 20);
      const t2 = setTimeout(() => titleRef.current?.focus(), 100);
      return () => { clearTimeout(t); clearTimeout(t2); };
    } else {
      setMounted(false);
    }
  }, [open, defaultListId, lists]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Close on backdrop click (but not when clicking antd popups like DatePicker)
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        // Don't close if the click landed inside an antd dropdown/popup
        if (target.closest('.ant-picker-dropdown') || target.closest('.ant-select-dropdown')) {
          return;
        }
        onClose();
      }
    },
    [onClose],
  );

  // Auto-resize title textarea
  useEffect(() => {
    const ta = titleRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [title]);

  // Build combined due date
  const getDueDateISO = useCallback((): string | undefined => {
    if (!dueDate) return undefined;
    let d = dueDate.hour(9).minute(0).second(0);
    if (dueTime) {
      d = d.hour(dueTime.hour()).minute(dueTime.minute());
    }
    return d.toISOString();
  }, [dueDate, dueTime]);

  const handleAddCheckItem = useCallback(() => {
    const text = newCheckItem.trim();
    if (!text) return;
    setChecklistItems((prev) => [...prev, { title: text, completed: false }]);
    setNewCheckItem('');
  }, [newCheckItem]);

  const handleRemoveCheckItem = useCallback((index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleToggleCheckItem = useCallback((index: number) => {
    setChecklistItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, completed: !item.completed } : item)),
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      message.warning('请输入任务标题');
      titleRef.current?.focus();
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    onSubmit({
      title: title.trim(),
      content: content.trim() || undefined,
      priority,
      dueDate: getDueDateISO(),
      checklistItems: checklistItems.length > 0 ? checklistItems.map((ci) => ci.title) : undefined,
    });
    setTimeout(() => setIsSubmitting(false), 500);
  }, [title, content, priority, getDueDateISO, checklistItems, isSubmitting, onSubmit, message]);

  if (!open) return null;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '11vh',
        background: mounted
          ? 'rgba(0, 0, 0, 0.45)'
          : 'rgba(0, 0, 0, 0)',
        backdropFilter: mounted ? 'blur(2px) saturate(0.6)' : 'blur(0px) saturate(1)',
        WebkitBackdropFilter: mounted ? 'blur(2px) saturate(0.6)' : 'blur(0px) saturate(1)',
        transition: 'background 0.35s cubic-bezier(0.19, 1, 0.22, 1), backdrop-filter 0.35s cubic-bezier(0.19, 1, 0.22, 1)',
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: 520,
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 22vh)',
          overflowY: 'auto',
          background: 'rgba(24, 24, 32, 0.85)',
          backdropFilter: 'blur(48px) saturate(200%)',
          WebkitBackdropFilter: 'blur(48px) saturate(200%)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.04) inset,
            0 1px 0 rgba(255, 255, 255, 0.04) inset,
            0 8px 32px rgba(0, 0, 0, 0.5),
            0 2px 8px rgba(0, 0, 0, 0.3),
            0 24px 80px rgba(0, 0, 0, 0.4)
          `,
          transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(12px)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
        }}
      >
        {/* Top highlight bar */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.06) 80%, transparent 100%)',
        }} />

        {/* Header */}
        <div style={{
          padding: '18px 22px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, rgba(255, 119, 89, 0.25) 0%, rgba(255, 119, 89, 0.15) 100%)',
            border: '1px solid rgba(255, 119, 89, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ThunderboltOutlined style={{ color: '#0075de', fontSize: 15 }} />
          </div>
          <Text style={{ fontSize: 15, fontWeight: 600, color: '#e8e8ec', letterSpacing: '-0.01em' }}>
            创建任务
          </Text>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <FontSizeOutlined style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }} />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                标题
              </Text>
            </div>
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="任务标题"
              rows={1}
              spellCheck={false}
              style={{
                width: '100%',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                color: '#e8e8ec',
                fontSize: 15,
                fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                fontWeight: 400,
                lineHeight: 1.55,
                letterSpacing: '-0.01em',
                padding: '10px 14px',
                outline: 'none',
                resize: 'none',
                caretColor: '#0075de',
                transition: 'border-color 0.2s ease',
                overflow: 'hidden',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 119, 89, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            />
          </div>

          {/* Content */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <AlignLeftOutlined style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }} />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                描述
              </Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', marginLeft: 'auto' }}>
                支持 Markdown
              </Text>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="详细描述...（可选）"
              rows={3}
              spellCheck={false}
              style={{
                width: '100%',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                color: '#c8c4d8',
                fontSize: 13,
                fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                fontWeight: 400,
                lineHeight: 1.6,
                letterSpacing: '-0.01em',
                padding: '10px 14px',
                outline: 'none',
                resize: 'vertical',
                caretColor: '#0075de',
                minHeight: 72,
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 119, 89, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            />
          </div>

          {/* Priority + Due Date row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {/* Priority */}
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <FlagOutlined style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }} />
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  优先级
                </Text>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: 8,
                      border: priority === opt.value
                        ? `1px solid ${opt.color}`
                        : '1px solid rgba(255,255,255,0.06)',
                      background: priority === opt.value ? opt.bg : 'rgba(255,255,255,0.03)',
                      color: priority === opt.value ? opt.color : 'rgba(255,255,255,0.25)',
                      fontSize: 12,
                      fontWeight: priority === opt.value ? 600 : 400,
                      fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <CalendarOutlined style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }} />
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  截止日期
                </Text>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <DatePicker
                  value={dueDate}
                  onChange={(d) => setDueDate(d)}
                  placeholder="选择日期"
                  popupStyle={{ zIndex: 10000 }}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#c8c4d8',
                    fontSize: 12,
                    fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                  }}
                />
                <DatePicker
                  picker="time"
                  value={dueTime}
                  onChange={(t) => setDueTime(t)}
                  placeholder="时间"
                  format="HH:mm"
                  popupStyle={{ zIndex: 10000 }}
                  style={{
                    width: 100,
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#c8c4d8',
                    fontSize: 12,
                    fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <CheckSquareOutlined style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }} />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                检查项
              </Text>
              {checklistItems.length > 0 && (
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 4 }}>
                  {checklistItems.length}
                </Text>
              )}
            </div>

            {/* Existing items */}
            {checklistItems.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Checkbox
                      checked={item.completed}
                      onChange={() => handleToggleCheckItem(idx)}
                      style={{ margin: 0, lineHeight: 1 }}
                    />
                    <Text style={{
                      flex: 1,
                      fontSize: 12.5,
                      color: '#c8c4d8',
                      fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                      letterSpacing: '-0.01em',
                    }}>
                      {item.title}
                    </Text>
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckItem(idx)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
                    >
                      <CloseOutlined style={{ fontSize: 10 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add item input */}
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCheckItem();
                  }
                }}
                placeholder="添加检查项..."
                style={{
                  flex: 1,
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  color: '#c8c4d8',
                  fontSize: 12.5,
                  fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                  padding: '6px 10px',
                  outline: 'none',
                  caretColor: '#0075de',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 119, 89, 0.4)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              />
              <button
                type="button"
                onClick={handleAddCheckItem}
                disabled={!newCheckItem.trim()}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: newCheckItem.trim()
                    ? 'rgba(255, 119, 89, 0.12)'
                    : 'rgba(255,255,255,0.03)',
                  color: newCheckItem.trim() ? '#0075de' : 'rgba(255,255,255,0.15)',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                  cursor: newCheckItem.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <PlusOutlined style={{ fontSize: 10 }} />
                添加
              </button>
            </div>
          </div>

          {/* TODO: Assignee — needs project members API */}
          {/* <AssigneeSelector projectId={projectId} /> */}

          {/* Divider */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.06) 100%)',
          }} />

          {/* Footer: List selector + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            {/* List selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                List
              </Text>
              <select
                value={selectedListId ?? ''}
                onChange={(e) => setSelectedListId(e.target.value ? Number(e.target.value) : null)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '5px 24px 5px 10px',
                  fontSize: 12,
                  fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                  fontWeight: 500,
                  color: '#c8c4d8',
                  cursor: 'pointer',
                  outline: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='5' viewBox='0 0 8 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L4 4L7 1' stroke='%23888090' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id} style={{ color: '#1a1a24', background: '#fff' }}>
                    {l.name}
                  </option>
                ))}
                {lists.length === 0 && (
                  <option value="" style={{ color: '#1a1a24', background: '#fff' }}>
                    暂无列表
                  </option>
                )}
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '7px 18px',
                  borderRadius: 9999,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 12.5,
                  fontWeight: 500,
                  fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!title.trim() || isSubmitting}
                style={{
                  padding: '7px 22px',
                  borderRadius: 9999,
                  border: 'none',
                  background: title.trim()
                    ? 'linear-gradient(135deg, #0075de 0%, #005bab 100%)'
                    : 'rgba(255,255,255,0.05)',
                  color: title.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                  cursor: title.trim() ? 'pointer' : 'default',
                  letterSpacing: '0.01em',
                  transition: 'all 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
                  boxShadow: title.trim()
                    ? '0 2px 8px rgba(88, 152, 216, 0.35), 0 0 0 2px rgba(88, 152, 216, 0.12)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!title.trim()) return;
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isSubmitting ? '创建中...' : '创建任务 ✨'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
