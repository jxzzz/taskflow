import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Typography } from 'antd';
import {
  ThunderboltOutlined,
  CalendarOutlined,
  TagOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { TaskListSummary } from '@/types/task';

dayjs.extend(customParseFormat);

const { Text } = Typography;

/** Parsed token extracted from natural language input */
interface ParsedDate {
  raw: string;
  display: string;
  iso: string;
}

interface ParsedTokens {
  title: string;
  dueDate: ParsedDate | null;
  priority: number;
  tags: string[];
}

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; dueDate?: string; priority?: number }) => void;
  lists: TaskListSummary[];
  defaultListId?: number;
}

/** ====== Natural Language Parsing Engine ====== */

const DATE_PATTERNS: { regex: RegExp; handler: (m: RegExpMatchArray) => dayjs.Dayjs | null }[] = [
  // "tomorrow at 3pm", "tomorrow at 3:00pm"
  {
    regex: /tomorrow\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    handler: (m) => {
      let hour = parseInt(m[1]);
      const min = m[2] ? parseInt(m[2]) : 0;
      const mer = m[3]?.toLowerCase();
      if (mer === 'pm' && hour < 12) hour += 12;
      if (mer === 'am' && hour === 12) hour = 0;
      return dayjs().add(1, 'day').hour(hour).minute(min).second(0);
    },
  },
  // "tomorrow"
  {
    regex: /tomorrow/i,
    handler: () => dayjs().add(1, 'day').hour(9).minute(0).second(0),
  },
  // "today at 3pm", "today at 15:00"
  {
    regex: /today\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    handler: (m) => {
      let hour = parseInt(m[1]);
      const min = m[2] ? parseInt(m[2]) : 0;
      const mer = m[3]?.toLowerCase();
      if (mer === 'pm' && hour < 12) hour += 12;
      if (mer === 'am' && hour === 12) hour = 0;
      return dayjs().hour(hour).minute(min).second(0);
    },
  },
  // "today"
  {
    regex: /today/i,
    handler: () => dayjs().hour(17).minute(0).second(0),
  },
  // "next Monday at 2pm", "next monday"
  {
    regex: /next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*(at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i,
    handler: (m) => {
      const dayMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
      };
      const targetDay = dayMap[m[1].toLowerCase()];
      const now = dayjs();
      let daysUntil = targetDay - now.day();
      if (daysUntil <= 0) daysUntil += 7;
      let date = now.add(daysUntil, 'day');
      if (m[3]) {
        let hour = parseInt(m[3]);
        const min = m[4] ? parseInt(m[4]) : 0;
        const mer = m[5]?.toLowerCase();
        if (mer === 'pm' && hour < 12) hour += 12;
        if (mer === 'am' && hour === 12) hour = 0;
        date = date.hour(hour).minute(min);
      } else {
        date = date.hour(9).minute(0);
      }
      return date.second(0);
    },
  },
  // "Monday at 6pm" (this coming Monday)
  {
    regex: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i,
    handler: (m) => {
      const dayMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
      };
      const targetDay = dayMap[m[1].toLowerCase()];
      const now = dayjs();
      let daysUntil = targetDay - now.day();
      if (daysUntil < 0) daysUntil += 7;
      if (daysUntil === 0) {
        // Same day — if it's already past, go to next week
        const candidate = now.hour(23).minute(59);
        if (now.isAfter(candidate)) daysUntil = 7;
      }
      let date = now.add(daysUntil || 7, 'day');
      if (m[3]) {
        let hour = parseInt(m[3]);
        const min = m[4] ? parseInt(m[4]) : 0;
        const mer = m[5]?.toLowerCase();
        if (mer === 'pm' && hour < 12) hour += 12;
        if (mer === 'am' && hour === 12) hour = 0;
        date = date.hour(hour).minute(min);
      } else {
        date = date.hour(9).minute(0);
      }
      return date.second(0);
    },
  },
  // "Mar 15", "March 15", "Mar 15 3pm", "Mar 15 at 3pm"
  {
    regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:at\s+)?(\d{1,2})?(?::(\d{2}))?\s*(am|pm)?/i,
    handler: (m) => {
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      };
      const month = months[m[1].toLowerCase().slice(0, 3)];
      const day = parseInt(m[2]);
      let date = dayjs().month(month).date(day);
      if (m[3]) {
        let hour = parseInt(m[3]);
        const min = m[4] ? parseInt(m[4]) : 0;
        const mer = m[5]?.toLowerCase();
        if (mer === 'pm' && hour < 12) hour += 12;
        if (mer === 'am' && hour === 12) hour = 0;
        date = date.hour(hour).minute(min);
      } else {
        date = date.hour(9).minute(0);
      }
      return date.second(0);
    },
  },
  // "at 3pm", "at 15:00" (bare time, defaults to today)
  {
    regex: /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    handler: (m) => {
      let hour = parseInt(m[1]);
      const min = m[2] ? parseInt(m[2]) : 0;
      const mer = m[3]?.toLowerCase();
      if (mer === 'pm' && hour < 12) hour += 12;
      if (mer === 'am' && hour === 12) hour = 0;
      let date = dayjs().hour(hour).minute(min).second(0);
      if (date.isBefore(dayjs())) date = date.add(1, 'day');
      return date;
    },
  },
  // "in 2 hours", "in 30 minutes"
  {
    regex: /in\s+(\d+)\s+(hour|minute|day|week)s?/i,
    handler: (m) => {
      const amount = parseInt(m[1]);
      const unit = m[2].toLowerCase() as 'hour' | 'minute' | 'day' | 'week';
      return dayjs().add(amount, unit);
    },
  },
];

const TAG_REGEX = /#([\w一-鿿][\w一-鿿-]*)/g;
const PRIORITY_REGEX = /!(\d|high|mid|low|urgent|critical)\b/i;

const PRIORITY_MAP: Record<string, number> = {
  '0': 0, 'low': 0,
  '1': 1, 'mid': 1, 'medium': 1,
  '2': 2, 'high': 2, 'urgent': 2, 'critical': 2,
};

function formatDateDisplay(date: dayjs.Dayjs): string {
  const now = dayjs();
  const diffDays = date.diff(now.startOf('day'), 'day');

  let prefix = '';
  if (diffDays === 0) prefix = 'Today';
  else if (diffDays === 1) prefix = 'Tomorrow';
  else if (diffDays < 7) prefix = date.format('dddd');
  else prefix = date.format('MMM D');

  const time = date.format('h:mm A');
  return `${prefix} at ${time}`;
}

export function parseQuickAddInput(text: string): ParsedTokens {
  // Extract tags
  const tags: string[] = [];
  let tagMatch;
  const tagRegex = new RegExp(TAG_REGEX.source, 'g');
  while ((tagMatch = tagRegex.exec(text)) !== null) {
    tags.push(tagMatch[1]);
  }

  // Extract priority
  let priority = 0;
  const priorityMatch = text.match(PRIORITY_REGEX);
  if (priorityMatch) {
    priority = PRIORITY_MAP[priorityMatch[1].toLowerCase()] ?? 0;
  }

  // Extract date
  let dueDate: ParsedDate | null = null;
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      const parsed = pattern.handler(match);
      if (parsed && parsed.isValid() && parsed.isAfter(dayjs())) {
        dueDate = {
          raw: match[0],
          display: formatDateDisplay(parsed),
          iso: parsed.toISOString(),
        };
        break;
      }
    }
  }

  // Clean title — remove date expressions, tags, and priority markers
  let title = text;
  if (dueDate) {
    title = title.replace(new RegExp(dueDate.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '');
  }
  title = title.replace(TAG_REGEX, '');
  title = title.replace(PRIORITY_REGEX, '');
  title = title.replace(/\s{2,}/g, ' ').trim();

  return { title: title || text.trim(), dueDate, priority, tags };
}

/** ====== QuickAddModal Component ====== */

export default function QuickAddModal({
  open,
  onClose,
  onSubmit,
  lists,
  defaultListId,
}: QuickAddModalProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(defaultListId || (lists[0]?.id ?? null));
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Entrance animation
  useEffect(() => {
    if (open) {
      setInput('');
      setSelectedListId(defaultListId || lists[0]?.id || null);
      setIsSubmitting(false);
      const t = setTimeout(() => setMounted(true), 20);
      // Focus input after animation
      const t2 = setTimeout(() => inputRef.current?.focus(), 80);
      return () => { clearTimeout(t); clearTimeout(t2); };
    } else {
      setMounted(false);
    }
  }, [open, defaultListId, lists]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [input]);

  // Parse input in real-time
  const parsed = useMemo(() => parseQuickAddInput(input), [input]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isSubmitting) return;
    setIsSubmitting(true);
    onSubmit({
      title: parsed.title,
      dueDate: parsed.dueDate?.iso,
      priority: parsed.priority,
    });
    // Parent handles close on success
    setTimeout(() => setIsSubmitting(false), 500);
  }, [input, parsed, isSubmitting, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [handleSubmit, onClose],
  );

  if (!open) return null;

  const hasTokens = parsed.dueDate || parsed.tags.length > 0 || parsed.priority > 0;

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
        paddingTop: '16vh',
        background: mounted
          ? 'rgba(0, 0, 0, 0.45)'
          : 'rgba(0, 0, 0, 0)',
        backdropFilter: mounted ? 'blur(2px) saturate(0.6)' : 'blur(0px) saturate(1)',
        WebkitBackdropFilter: mounted ? 'blur(2px) saturate(0.6)' : 'blur(0px) saturate(1)',
        transition: 'background 0.35s cubic-bezier(0.19, 1, 0.22, 1), backdrop-filter 0.35s cubic-bezier(0.19, 1, 0.22, 1)',
      }}
    >
      {/* ====== COMMAND PALETTE CONTAINER ====== */}
      <div
        ref={containerRef}
        className="quick-add-container"
        style={{
          width: 560,
          maxWidth: 'calc(100vw - 48px)',
          background: 'rgba(24, 24, 32, 0.82)',
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
          overflow: 'hidden',
        }}
      >
        {/* Subtle top highlight bar */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.06) 80%, transparent 100%)',
          }}
        />

        {/* ====== INPUT AREA ====== */}
        <div style={{ padding: '20px 22px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            {/* Command icon */}
            <div
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg, rgba(247, 200, 108, 0.25) 0%, rgba(240, 160, 80, 0.15) 100%)',
                border: '1px solid rgba(247, 200, 108, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 4,
              }}
            >
              <ThunderboltOutlined style={{ color: '#f7c86c', fontSize: 15 }} />
            </div>

            {/* Text input */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What needs to be done?"
                rows={1}
                autoFocus
                spellCheck={false}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  background: 'transparent',
                  color: '#e8e6f0',
                  fontSize: 17,
                  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 400,
                  lineHeight: 1.55,
                  letterSpacing: '-0.01em',
                  padding: 0,
                  margin: 0,
                  overflow: 'hidden',
                  caretColor: '#f7c86c',
                }}
              />
            </div>
          </div>
        </div>

        {/* ====== PARSED TOKENS AREA ====== */}
        <div
          style={{
            padding: hasTokens ? '4px 22px 14px' : '0 22px 0px',
            paddingLeft: 66, // Align with input text
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            maxHeight: hasTokens ? 80 : 0,
            opacity: hasTokens ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Date pill */}
          {parsed.dueDate && (
            <span
              className="quick-add-token quick-add-token-date"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                background: 'rgba(139, 180, 220, 0.14)',
                border: '1px solid rgba(139, 180, 220, 0.22)',
                color: '#a8cef0',
                animation: 'tokenPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
              }}
            >
              <CalendarOutlined style={{ fontSize: 11 }} />
              {parsed.dueDate.display}
            </span>
          )}

          {/* Priority pill */}
          {parsed.priority > 0 && (
            <span
              className="quick-add-token quick-add-token-priority"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                background: parsed.priority === 2
                  ? 'rgba(232, 96, 96, 0.14)'
                  : 'rgba(240, 180, 80, 0.14)',
                border: parsed.priority === 2
                  ? '1px solid rgba(232, 96, 96, 0.22)'
                  : '1px solid rgba(240, 180, 80, 0.22)',
                color: parsed.priority === 2 ? '#f09090' : '#f0c860',
                animation: 'tokenPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both',
              }}
            >
              <FlagOutlined style={{ fontSize: 11 }} />
              {parsed.priority === 2 ? 'Urgent' : 'Priority'}
            </span>
          )}

          {/* Tag pills */}
          {parsed.tags.map((tag, i) => (
            <span
              key={tag}
              className="quick-add-token quick-add-token-tag"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                background: 'rgba(232, 160, 156, 0.12)',
                border: '1px solid rgba(232, 160, 156, 0.2)',
                color: '#e8a09c',
                animation: `tokenPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.1 + i * 0.06}s both`,
              }}
            >
              <TagOutlined style={{ fontSize: 10 }} />
              {tag}
            </span>
          ))}
        </div>

        {/* ====== DIVIDER ====== */}
        <div
          style={{
            height: 1,
            margin: '0 22px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.06) 100%)',
          }}
        />

        {/* ====== FOOTER ====== */}
        <div
          style={{
            padding: '10px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
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
                padding: '3px 24px 3px 10px',
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
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
                  No lists yet
                </option>
              )}
            </select>
          </div>

          {/* Right side: hints + submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Keyboard hints */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <kbd
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '1px 6px',
                  borderRadius: 5,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 10,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.02em',
                }}
              >
                Esc
              </kbd>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>close</Text>
              <kbd
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '1px 6px',
                  borderRadius: 5,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 10,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.02em',
                }}
              >
                ⏎
              </kbd>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>create</Text>
            </div>

            {/* Divider dot */}
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isSubmitting}
              style={{
                padding: '6px 16px',
                borderRadius: 9999,
                border: 'none',
                background: input.trim()
                  ? 'linear-gradient(135deg, #6eb5f0 0%, #5898d8 50%, #4a85c9 100%)'
                  : 'rgba(255,255,255,0.05)',
                color: input.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: input.trim() ? 'pointer' : 'default',
                letterSpacing: '0.01em',
                transition: 'all 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
                boxShadow: input.trim()
                  ? '0 2px 8px rgba(88, 152, 216, 0.35), 0 0 0 2px rgba(88, 152, 216, 0.12)'
                  : 'none',
                transform: input.trim() ? 'scale(1)' : 'scale(0.96)',
              }}
              onMouseEnter={(e) => {
                if (!input.trim()) return;
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow =
                  '0 4px 14px rgba(88, 152, 216, 0.45), 0 0 0 4px rgba(88, 152, 216, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = input.trim()
                  ? '0 2px 8px rgba(88, 152, 216, 0.35), 0 0 0 2px rgba(88, 152, 216, 0.12)'
                  : 'none';
              }}
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
