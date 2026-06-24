import { Row, Col, Typography, Card, Tag } from 'antd';
import { ProjectOutlined, UserOutlined, CheckSquareOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { useDashboard } from '@/hooks/useDashboard';
import { ROUTES } from '@/router/routes';
import { useAuthStore } from '@/stores/authStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isFetching } = useDashboard();

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
      <PageHeader
        title={`你好，${user?.username || '用户'}`}
        subtitle="欢迎使用 TaskFlow"
      />

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {statCards.map((stat) => (
          <Col xs={24} sm={8} key={stat.label}>
            <Card size="small" style={{ border: 'none' }} loading={isFetching}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14, background: stat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: stat.color, flexShrink: 0,
                }}>
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

      {/* Recent projects */}
      <Card style={{ border: 'none' }} loading={isFetching}>
        <Title level={5} style={{ fontFamily: "'Newsreader', Georgia, serif", fontWeight: 500, marginBottom: 16 }}>
          我的项目
        </Title>

        {data?.projects && data.projects.length > 0 ? (
          <Row gutter={[12, 12]}>
            {data.projects.map((p) => (
              <Col xs={24} sm={12} md={8} key={p.id}>
                <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: 14, borderRadius: 12, border: '1px solid var(--color-border-subtle)',
                    transition: 'all 200ms cubic-bezier(0.19,1,0.22,1)',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-surface)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#2b2825', marginBottom: 6 }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Tag style={{ background: 'var(--tag-lavender)', color: 'var(--tag-lavender-text)', border: 'none', margin: 0, fontSize: 11 }}>
                        {p.ownerName}
                      </Tag>
                      <Text style={{ fontSize: 11, color: 'rgba(43,40,37,0.35)' }}>
                        {p.taskCount} 任务 · {p.memberCount} 人 · {dayjs(p.createTime).format('MM-DD')}
                      </Text>
                    </div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        ) : (
          <Text style={{ color: 'rgba(43,40,37,0.4)' }}>
            还没有项目，
            <Link to={ROUTES.PROJECTS}>创建一个</Link>
            开始协作
          </Text>
        )}
      </Card>
    </div>
  );
}
