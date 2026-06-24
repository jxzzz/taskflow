import { Row, Col, Typography, Card } from 'antd';
import { ProjectOutlined, UserOutlined, ThunderboltOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { useUsers } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { ROUTES } from '@/router/routes';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

const statCard = (icon: React.ReactNode, value: string | number, label: string, bg: string, color: string, link?: string) => (
  <Card size="small" style={{ border: 'none' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2b2825', lineHeight: 1.2 }}>{value}</div>
        <Text style={{ fontSize: 12.5, color: 'rgba(43,40,37,0.48)' }}>{label}</Text>
      </div>
      {link && <ArrowRightOutlined style={{ marginLeft: 'auto', color: 'rgba(43,40,37,0.25)', fontSize: 14 }} />}
    </div>
  </Card>
);

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: usersData } = useUsers(1, 1);
  const { data: projectsData } = useProjects(1, 1);

  return (
    <div>
      <PageHeader title={`你好，${user?.username || '用户'}`} subtitle="欢迎使用 TaskFlow" />

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Link to={ROUTES.PROJECTS} style={{ textDecoration: 'none' }}>
            {statCard(<ProjectOutlined />, projectsData?.total ?? '—', '项目', 'var(--color-lavender-soft)', 'var(--color-lavender)', ROUTES.PROJECTS)}
          </Link>
        </Col>
        <Col xs={24} sm={8}>
          {statCard(<UserOutlined />, usersData?.total ?? '—', '用户', 'var(--color-sage-soft)', 'var(--color-sage)')}
        </Col>
        <Col xs={24} sm={8}>
          {statCard(<ThunderboltOutlined />, '—', '任务', 'var(--color-butter-soft)', 'var(--color-butter)')}
        </Col>
      </Row>

      <Card style={{ border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Title level={5} style={{ fontFamily: "'Newsreader', Georgia, serif", fontWeight: 500, marginBottom: 8 }}>快速开始</Title>
            <Text style={{ color: 'rgba(43,40,37,0.55)', lineHeight: 1.7 }}>
              创建你的第一个<Link to={ROUTES.PROJECTS}>项目</Link>，添加任务列表和卡片，邀请团队成员开始协作。TaskFlow 帮助你更高效地管理项目和任务。
            </Text>
          </div>
          <div style={{
            width: 160, height: 100, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(155,151,212,0.08), rgba(232,160,156,0.06))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ThunderboltOutlined style={{ fontSize: 40, color: 'var(--color-lavender)', opacity: 0.6 }} />
          </div>
        </div>
      </Card>
    </div>
  );
}
