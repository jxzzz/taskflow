import { useMemo } from 'react';
import { Typography, Tag } from 'antd';
import {
  ClockCircleOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TaskCardBrief, TaskListSummary } from '@/types/task';

const { Text } = Typography;

interface TaskListViewProps {
  lists: TaskListSummary[];
  onTaskClick: (taskId: number) => void;
}

const PRIORITY_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: '普通', color: 'var(--color-ink-tertiary)', bg: 'rgba(0,0,0,0.04)' },
  1: { label: '紧急', color: '#9e853d', bg: '#faf0da' },
  2: { label: '非常紧急', color: '#b86d6a', bg: '#fae3e1' },
};

const LIST_COLORS = [
  { color: '#9b97d4', bg: 'rgba(155,151,212,0.08)' },
  { color: '#f0a850', bg: 'rgba(240,168,80,0.08)' },
  { color: '#9bbc9e', bg: 'rgba(155,188,158,0.08)' },
  { color: '#99bcdb', bg: 'rgba(153,188,219,0.08)' },
  { color: '#e8a09c', bg: 'rgba(232,160,156,0.08)' },
];

interface FlatTask extends TaskCardBrief {
  listId: number;
  listName: string;
}

export default function TaskListView({ lists, onTaskClick }: TaskListViewProps) {
  const tasks = useMemo<FlatTask[]>(() => {
    const result: FlatTask[] = [];
    lists.forEach((list) => {
      list.tasks.forEach((task) => {
        result.push({ ...task, listId: list.id, listName: list.name });
      });
    });
    return result;
  }, [lists]);

  const totalTasks = tasks.length;

  if (totalTasks === 0) return null;

  return (
    <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 140px 100px 100px 130px',
          gap: 0,
          padding: '8px 16px',
          borderBottom: '1px solid var(--color-border-subtle)',
          position: 'sticky',
          top: 0,
          background: 'var(--color-bg-deep)',
          zIndex: 1,
        }}
      >
        {['任务', '所属列表', '优先级', '负责人', '截止日期'].map((label) => (
          <Text
            key={label}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-ink-disabled)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}
          </Text>
        ))}
      </div>

      {/* Rows */}
      {tasks.map((task, i) => {
        const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[0];
        const listColor = LIST_COLORS[task.listId % LIST_COLORS.length];
        const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs());

        return (
          <div
            key={task.id}
            onClick={() => onTaskClick(task.id)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 100px 100px 130px',
              gap: 0,
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border-subtle)',
              cursor: 'pointer',
              background: 'transparent',
              transition: 'background 0.15s ease',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {/* Task title + checklist indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: 'var(--color-ink-primary)',
                  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {task.title}
              </Text>
              {task.checklistCount > 0 && (
                <span style={{
                  fontSize: 11,
                  color: task.completedChecklistCount === task.checklistCount
                    ? 'var(--color-sage)'
                    : 'var(--color-ink-tertiary)',
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}>
                  {task.completedChecklistCount}/{task.checklistCount}
                </span>
              )}
            </div>

            {/* List name */}
            <Tag
              style={{
                background: listColor.bg,
                color: listColor.color,
                border: 'none',
                margin: 0,
                fontSize: 11.5,
                fontWeight: 500,
                borderRadius: 9999,
                padding: '1px 10px',
                maxWidth: 'fit-content',
              }}
            >
              {task.listName}
            </Tag>

            {/* Priority */}
            <span
              style={{
                fontSize: 12,
                color: priority.color,
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {task.priority > 0 && <FlagOutlined style={{ fontSize: 10 }} />}
              {priority.label}
            </span>

            {/* Assignee */}
            <Text
              style={{
                fontSize: 12.5,
                color: task.assigneeName ? 'var(--color-ink-secondary)' : 'var(--color-ink-disabled)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {task.assigneeName || '—'}
            </Text>

            {/* Due date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {task.dueDate && (
                <ClockCircleOutlined
                  style={{
                    fontSize: 11,
                    color: isOverdue ? '#b86d6a' : 'var(--color-ink-tertiary)',
                  }}
                />
              )}
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontVariantNumeric: 'tabular-nums',
                  color: task.dueDate
                    ? isOverdue
                      ? '#b86d6a'
                      : 'var(--color-ink-secondary)'
                    : 'var(--color-ink-disabled)',
                  fontWeight: task.dueDate ? 500 : 400,
                }}
              >
                {task.dueDate ? dayjs(task.dueDate).format('MM/DD HH:mm') : '—'}
              </Text>
            </div>
          </div>
        );
      })}

      {/* Footer count */}
      <div style={{ padding: '10px 16px', borderTop: 'none' }}>
        <Text style={{ fontSize: 11.5, color: 'var(--color-ink-disabled)', fontFamily: "'DM Sans', sans-serif" }}>
          共 {totalTasks} 个任务
        </Text>
      </div>
    </div>
  );
}
