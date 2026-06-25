import { useState, useCallback } from 'react';
import { Row, Col, Typography, Card, Tag, Skeleton, message } from 'antd';
import {
  ProjectOutlined,
  UserOutlined,
  CheckSquareOutlined,
  ArrowRightOutlined,
  GlobalOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import QuickActionFab from '@/components/common/QuickActionFab';
import { useQuickActionItems } from '@/components/common/QuickActionFab';
import CreateProjectModal from '@/components/common/CreateProjectModal';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import { useDashboard } from '@/hooks/useDashboard';
import { useActivities } from '@/hooks/useActivity';
import { useCreateProject } from '@/hooks/useProjects';
import { ROUTES } from '@/router/routes';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore, COLOR_SCHEMES, type ColorScheme, type Language } from '@/stores/appStore';
import type { CreateProjectRequest } from '@/types/project';
import { PROJECT_STATUS_CONFIG } from '@/types/project';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isFetching } = useDashboard();
  const { data: activityData, isFetching: activityLoading } = useActivities();

  // App-wide settings
  const colorScheme = useAppStore((s) => s.colorScheme);
  const setColorScheme = useAppStore((s) => s.setColorScheme);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  // Create project modal
  const [createOpen, setCreateOpen] = useState(false);
  const createMutation = useCreateProject();

  const handleCreateProject = useCallback(
    (values: CreateProjectRequest) => {
      createMutation.mutate(values, { onSuccess: () => setCreateOpen(false) });
    },
    [createMutation],
  );

  // Theme cycling
  const handleToggleTheme = useCallback(() => {
    const schemes: ColorScheme[] = ['pastel-warm', 'pastel-cool', 'pastel-mint', 'pastel-rose'];
    const idx = schemes.indexOf(colorScheme);
    const next = schemes[(idx + 1) % schemes.length];
    setColorScheme(next);
    message.success(`配色方案：${COLOR_SCHEMES[next].label}`);
  }, [colorScheme, setColorScheme]);

  // Language toggle
  const handleToggleLanguage = useCallback(() => {
    const next: Language = language === 'zh-CN' ? 'en' : 'zh-CN';
    setLanguage(next);
    message.success(next === 'zh-CN' ? '已切换为中文' : 'Switched to English');
  }, [language, setLanguage]);

  // Quick action menu items
  const quickActionItems = useQuickActionItems(
    () => setCreateOpen(true),
    handleToggleTheme,
    handleToggleLanguage,
  );

  const statCards = [
    {
      icon: <ProjectOutlined />,
      value: data?.totalProjects ?? '—',
      label: '项目',
      bg: 'var(--color-lavender-soft)',
      color: 'var(--color-lavender)',
      link: ROUTES.PROJECTS,
    },
    {
      icon: <CheckSquareOutlined />,
      value: data?.totalTasks ?? '—',
      label: '任务',
      bg: 'var(--color-butter-soft)',
      color: 'var(--color-butter)',
    },
    {
      icon: <UserOutlined />,
      value: data?.totalUsers ?? '—',
      label: '用户',
      bg: 'var(--color-sage-soft)',
      color: 'var(--color-sage)',
    },
  ];

  return (
    <div>
      <PageHeader title={`你好，${user?.username || '用户'}`} subtitle="欢迎使用 TaskFlow" />

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {statCards.map((stat) => (
          <Col xs={24} sm={8} key={stat.label}>
            <Card size="small" style={{ border: 'none' }} loading={isFetching}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: stat.color,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2b2825', lineHeight: 1.2 }}>
                    {stat.value}
                  </div>
                  <Text style={{ fontSize: 12.5, color: 'rgba(43,40,37,0.48)' }}>{stat.label}</Text>
                </div>
                {stat.link && (
                  <Link to={stat.link} style={{ marginLeft: 'auto' }}>
                    <ArrowRightOutlined style={{ color: 'rgba(43,40,37,0.25)', fontSize: 14 }} />
                  </Link>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* My Projects */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <Title
          level={5}
          style={{ fontFamily: "'Newsreader', Georgia, serif", fontWeight: 500, margin: 0 }}
        >
          我的项目
        </Title>
        {data?.projects && data.projects.length > 0 && (
          <Link to={ROUTES.PROJECTS} style={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
            查看全部 <ArrowRightOutlined style={{ fontSize: 11 }} />
          </Link>
        )}
      </div>

      {isFetching && !data ? (
        <Row gutter={[16, 16]}>
          {[1, 2].map((i) => (
            <Col xs={24} sm={12} key={i}>
              <div
                style={{
                  padding: '22px 24px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 2 }} />
              </div>
            </Col>
          ))}
        </Row>
      ) : data?.projects && data.projects.length > 0 ? (
        <Row gutter={[16, 16]}>
          {data.projects.map((p) => (
            <Col xs={24} sm={12} key={p.id}>
              <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-subtle)',
                    padding: '22px 24px',
                    cursor: 'pointer',
                    transition: 'all var(--duration-normal) var(--ease-out-expo)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    e.currentTarget.style.borderColor = 'var(--color-border-default)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                    e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Top row: name + status + arrow */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: 'var(--color-ink-primary)',
                        lineHeight: 1.3,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.name}
                    </div>
                    <Tag color={(PROJECT_STATUS_CONFIG[p.status] || PROJECT_STATUS_CONFIG.active).color} style={{ margin: 0, flexShrink: 0, fontSize: 11 }}>
                      {(PROJECT_STATUS_CONFIG[p.status] || PROJECT_STATUS_CONFIG.active).label}
                    </Tag>
                    <Tag style={{ margin: 0, flexShrink: 0, fontSize: 11, background: p.isPublic ? 'rgba(155,187,158,0.12)' : 'rgba(0,0,0,0.05)', color: p.isPublic ? '#5a8a5c' : 'var(--color-ink-tertiary)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      {p.isPublic ? <GlobalOutlined style={{ fontSize: 10 }} /> : <LockOutlined style={{ fontSize: 10 }} />}
                      {p.isPublic ? '公开' : '私有'}
                    </Tag>
                    <ArrowRightOutlined
                      style={{ color: 'var(--color-ink-disabled)', fontSize: 13, flexShrink: 0 }}
                    />
                  </div>

                  {/* Description */}
                  {p.description && (
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--color-ink-secondary)',
                        lineHeight: 1.5,
                        marginBottom: 14,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {p.description}
                    </div>
                  )}
                  {!p.description && <div style={{ height: 4 }} />}

                  {/* Bottom row: stats + date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Owner tag */}
                    <Tag
                      style={{
                        background: 'var(--tag-lavender)',
                        color: 'var(--tag-lavender-text)',
                        border: 'none',
                        margin: 0,
                        fontSize: 11,
                        borderRadius: 'var(--radius-xs)',
                        padding: '1px 8px',
                        lineHeight: '18px',
                      }}
                    >
                      {p.ownerName}
                    </Tag>

                    {/* Stats */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        fontSize: 12,
                        color: 'var(--color-ink-tertiary)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            background: 'var(--color-sage)',
                            display: 'inline-block',
                          }}
                        />
                        {p.listCount} 列表
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            background: 'var(--color-lavender)',
                            display: 'inline-block',
                          }}
                        />
                        {p.taskCount} 任务
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            background: 'var(--color-coral)',
                            display: 'inline-block',
                          }}
                        />
                        {p.memberCount} 人
                      </span>
                    </div>

                    {/* Date range or create time */}
                    <Text
                      style={{
                        fontSize: 11,
                        color: 'var(--color-ink-disabled)',
                        marginLeft: 'auto',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.startDate || p.endDate
                        ? `${p.startDate ? dayjs(p.startDate).format('MM/DD') : '?'} — ${p.endDate ? dayjs(p.endDate).format('MM/DD') : '?'}`
                        : dayjs(p.createTime).format('YYYY/MM/DD')}
                    </Text>
                  </div>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      ) : (
        <Card style={{ border: 'none', textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>
            <ProjectOutlined />
          </div>
          <Text style={{ color: 'var(--color-ink-tertiary)', fontSize: 14 }}>
            还没有项目，
            <Link to={ROUTES.PROJECTS}>创建一个</Link>
            开始协作
          </Text>
        </Card>
      )}

      {/* Activity Timeline */}
      <ActivityTimeline
        activities={activityData?.records}
        loading={activityLoading}
      />

      {/* Public projects */}
      {data?.publicProjects && data.publicProjects.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div
            style={{
              marginBottom: 20,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <Title
              level={5}
              style={{ fontFamily: "'Newsreader', Georgia, serif", fontWeight: 500, margin: 0 }}
            >
              发现项目
            </Title>
            <span style={{ fontSize: 12, color: 'var(--color-ink-disabled)' }}>
              {data.totalPublicProjects} 个公开项目
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {data.publicProjects.map((p) => (
              <Col xs={24} sm={12} md={8} key={p.id}>
                <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      background: 'var(--color-bg-elevated)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-subtle)',
                      padding: '20px 22px',
                      cursor: 'pointer',
                      transition: 'all var(--duration-normal) var(--ease-out-expo)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                      e.currentTarget.style.borderColor = 'var(--color-border-default)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text strong style={{ fontSize: 14, color: '#2b2825', fontFamily: "'DM Sans', sans-serif" }}>
                        {p.name}
                      </Text>
                      <ArrowRightOutlined style={{ color: 'var(--color-ink-disabled)', fontSize: 12, opacity: 0 }} className="pub-arrow" />
                    </div>
                    {p.description && (
                      <Text style={{ fontSize: 12, color: 'var(--color-ink-tertiary)', lineHeight: 1.5, display: 'block', marginBottom: 10 }}>
                        {p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}
                      </Text>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Tag style={{ margin: 0, background: 'rgba(155,151,212,0.08)', color: '#6b67a8', border: 'none', fontSize: 10 }}>
                        {p.ownerName}
                      </Tag>
                      <Tag color={(PROJECT_STATUS_CONFIG[p.status] || PROJECT_STATUS_CONFIG.active).color} style={{ margin: 0, fontSize: 10 }}>
                        {(PROJECT_STATUS_CONFIG[p.status] || PROJECT_STATUS_CONFIG.active).label}
                      </Tag>
                      <Tag style={{ margin: 0, fontSize: 10, background: 'rgba(155,187,158,0.12)', color: '#5a8a5c', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                        <GlobalOutlined style={{ fontSize: 10 }} />公开
                      </Tag>
                    </div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>

          <style>{`
            .pub-arrow { transition: opacity 0.15s ease; }
            *:hover > .pub-arrow { opacity: 1 !important; }
          `}</style>
        </div>
      )}

      {/* Quick Action FAB */}
      <QuickActionFab items={quickActionItems} />

      {/* Create project modal */}
      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateProject}
        loading={createMutation.isPending}
      />
    </div>
  );
}
