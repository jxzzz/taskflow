import { useState, useEffect, useMemo } from 'react';
import { Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TaskCardBrief, TaskListSummary } from '@/types/task';

const { Text } = Typography;

interface TaskListViewProps {
  lists: TaskListSummary[];
  onTaskClick: (taskId: number) => void;
}

const LIST_DOT: string[] = ['#0075de', '#dd5b00', '#1aae39', '#62aef0', '#d6b6f6'];

const PRIORITY_DOT: Record<number, string> = {
  0: 'transparent',
  1: 'var(--color-butter)',
  2: 'var(--color-coral)',
};

const PRIORITY_LABEL: Record<number, string> = {
  0: '',
  1: '紧急',
  2: '非常紧急',
};

interface FlatTask extends TaskCardBrief {
  listId: number;
  listName: string;
}

const GRID = '48px 1fr 68px 60px 72px 80px';

export default function TaskListView({ lists, onTaskClick }: TaskListViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, [lists]);

  const { tasks, totalTasks } = useMemo(() => {
    const flat: FlatTask[] = [];
    lists.forEach((list) => {
      list.tasks.forEach((task) => {
        flat.push({ ...task, listId: list.id, listName: list.name });
      });
    });
    return { tasks: flat, totalTasks: flat.length };
  }, [lists]);

  if (totalTasks === 0) return null;

  return (
    <div style={{ flex: 1, overflow: 'auto', minHeight: 0, paddingBottom: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px 14px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        <Text style={{ fontSize: 11.5, color: 'var(--color-ink-disabled)', fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif" }}>
          共 {totalTasks} 个任务
        </Text>
      </div>

      {/* Table */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          overflow: 'hidden',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.45s ease 0.05s, transform 0.45s ease 0.05s',
        }}
      >
        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID,
            padding: '10px 16px',
            background: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          {['', '任务', '列表', '优先级', '检查项', '截止日期'].map((label) => (
            <Text
              key={label}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-ink-disabled)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
              }}
            >
              {label}
            </Text>
          ))}
        </div>

        {/* Rows */}
        {tasks.map((task, i) => {
          const dot = LIST_DOT[task.listId % LIST_DOT.length];
          const pDot = PRIORITY_DOT[task.priority] || PRIORITY_DOT[0];
          const pLabel = PRIORITY_LABEL[task.priority] || '';
          const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs());
          const checklistPct =
            task.checklistCount > 0
              ? Math.round((task.completedChecklistCount / task.checklistCount) * 100)
              : 0;
          const checklistDone = task.checklistCount > 0 && task.completedChecklistCount === task.checklistCount;

          return (
            <div
              key={task.id}
              className="task-list-row"
              onClick={() => onTaskClick(task.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                alignItems: 'center',
                padding: '11px 16px',
                borderBottom: '1px solid var(--color-border-subtle)',
                cursor: 'pointer',
                background: 'transparent',
                transition: 'background 0.15s ease',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-8px)',
                transitionDelay: mounted ? `${0.08 + i * 0.025}s` : '0s',
              }}
            >
              {/* Priority dot */}
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: pDot,
                  justifySelf: 'center',
                }}
              />

              {/* Title */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-ink-primary)',
                  fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {task.title}
              </Text>

              {/* List */}
              <Text
                style={{
                  fontSize: 11.5,
                  color: dot,
                  fontWeight: 500,
                  fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                }}
              >
                {task.listName}
              </Text>

              {/* Priority */}
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: 500,
                  fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                  color: task.priority > 0 ? PRIORITY_DOT[task.priority] : 'var(--color-ink-disabled)',
                }}
              >
                {pLabel || '—'}
              </Text>

              {/* Checklist */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {task.checklistCount > 0 ? (
                  <>
                    <div
                      style={{
                        width: 32,
                        height: 3,
                        borderRadius: 2,
                        background: 'rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 2,
                          width: `${checklistPct}%`,
                          background: checklistDone ? 'var(--color-sage)' : 'var(--color-lavender)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                    <Text
                      style={{
                        fontSize: 10.5,
                        fontVariantNumeric: 'tabular-nums',
                        fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                        color: checklistDone ? 'var(--color-sage)' : 'var(--color-ink-tertiary)',
                        fontWeight: 500,
                      }}
                    >
                      {task.completedChecklistCount}/{task.checklistCount}
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 11.5, color: 'var(--color-ink-disabled)' }}>—</Text>
                )}
              </div>

              {/* Due date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                {task.dueDate && (
                  <ClockCircleOutlined
                    style={{ fontSize: 10.5, color: isOverdue ? '#b86d6a' : 'var(--color-ink-disabled)' }}
                  />
                )}
                <Text
                  style={{
                    fontSize: 11.5,
                    fontVariantNumeric: 'tabular-nums',
                    fontFamily: "'Inter', 'Arial', 'ui-sans-serif', sans-serif",
                    color: task.dueDate
                      ? isOverdue ? 'var(--color-coral)' : 'var(--color-ink-secondary)'
                      : 'var(--color-ink-disabled)',
                    fontWeight: task.dueDate ? 500 : 400,
                  }}
                >
                  {task.dueDate ? dayjs(task.dueDate).format('MM/DD') : '—'}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        .task-list-row:hover { background: var(--color-bg-hover) !important; }
      `}</style>
    </div>
  );
}
