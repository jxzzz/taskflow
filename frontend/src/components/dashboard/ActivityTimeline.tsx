import { Timeline, Tag, Skeleton, Empty, Typography } from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import type { ActivityLogEntry } from '@/types/activity';
import { ACTIVITY_ACTION_CONFIG } from '@/types/activity';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text } = Typography;

// ============================================================
// 组件
// ============================================================

interface ActivityTimelineProps {
  /** 真实数据传入后替代 mock */
  activities?: ActivityLogEntry[];
  /** 是否加载中 */
  loading?: boolean;
  /** 展示条数上限 */
  limit?: number;
}

export default function ActivityTimeline({
  activities,
  loading = false,
  limit = 8,
}: ActivityTimelineProps) {
  const displayItems = (activities ?? []).slice(0, limit);

  // ---- 加载态 ----
  if (loading) {
    return (
      <div style={{ marginTop: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              width: 80,
              height: 14,
              background: 'rgba(0,0,0,0.06)',
              borderRadius: 4,
            }}
          />
        </div>
        <Skeleton active paragraph={{ rows: 5 }} title={false} />
      </div>
    );
  }

  // ---- 空态 ----
  if (displayItems.length === 0) {
    return (
      <div style={{ marginTop: 28 }}>
        <Typography.Title
          level={5}
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontWeight: 500,
            margin: 0,
            marginBottom: 16,
          }}
        >
          最近动态
        </Typography.Title>
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            padding: '40px 0',
            textAlign: 'center',
          }}
        >
          <Empty description="暂无活动" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      </div>
    );
  }

  // ---- 渲染 ----
  return (
    <div style={{ marginTop: 28 }}>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <Typography.Title
          level={5}
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontWeight: 500,
            margin: 0,
          }}
        >
          最近动态
        </Typography.Title>
        {(activities?.length ?? 0) > limit && (
          <Link
            to="/activities"
            style={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}
          >
            查看全部 →
          </Link>
        )}
      </div>

      <div
        style={{
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          padding: '18px 24px 6px',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <Timeline
          items={displayItems.map((item) => {
            const cfg = ACTIVITY_ACTION_CONFIG[item.actionType] ?? {
              color: '#8c8c8c',
            };
            const timeStr = dayjs(item.createTime).fromNow();

            return {
              color: cfg.color,
              dot: (
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: cfg.color,
                    boxShadow: `0 0 0 3px ${cfg.color}18`,
                  }}
                />
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Text
                    style={{
                      fontSize: 13.5,
                      color: 'var(--color-ink-primary)',
                      lineHeight: 1.55,
                    }}
                  >
                    {item.description}
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link to={`/projects/${item.projectId}`}>
                      <Tag
                        style={{
                          margin: 0,
                          fontSize: 10.5,
                          background: 'var(--tag-lavender)',
                          color: 'var(--tag-lavender-text)',
                          border: 'none',
                          borderRadius: 4,
                          padding: '0 8px',
                          lineHeight: '19px',
                        }}
                      >
                        {item.projectName}
                      </Tag>
                    </Link>
                    <Text style={{ fontSize: 11, color: 'var(--color-ink-disabled)' }}>
                      {timeStr}
                    </Text>
                  </div>
                </div>
              ),
            };
          })}
        />
      </div>
    </div>
  );
}
