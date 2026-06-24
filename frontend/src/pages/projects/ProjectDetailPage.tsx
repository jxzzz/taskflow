import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Tag, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import { useProject } from '@/hooks/useProjects';

const { Text, Title } = Typography;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(Number(id));

  if (isLoading) return <div style={{ textAlign: 'center', padding: 120 }}><Spin /></div>;
  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4} style={{ color: 'rgba(43,40,37,0.4)' }}>项目不存在</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')} style={{ marginTop: 16 }}>返回项目列表</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={project.description || undefined}
        breadcrumb={[{ title: '项目', path: '/projects' }, { title: project.name }]}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>返回</Button>
            <Button type="primary" icon={<EditOutlined />} style={{ borderRadius: 50 }}>编辑</Button>
          </Space>
        }
      />

      {/* Info strip — what matters: who, how many, when */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
        background: 'rgba(155,151,212,0.04)', borderRadius: 14,
        border: '1px solid var(--color-border-subtle)',
      }}>
        <Tag style={{ background: 'var(--tag-lavender)', color: 'var(--tag-lavender-text)', border: 'none', margin: 0 }}>
          {project.ownerName || `用户 #${project.ownerId}`}
        </Tag>
        <Text style={{ fontSize: 12, color: 'rgba(43,40,37,0.3)' }}>·</Text>
        <TeamOutlined style={{ color: 'var(--color-lavender)', fontSize: 14 }} />
        <Text strong style={{ fontSize: 14 }}>{project.memberCount} 人</Text>
        <Text style={{ fontSize: 12, color: 'rgba(43,40,37,0.3)' }}>·</Text>
        <ClockCircleOutlined style={{ color: 'rgba(43,40,37,0.35)', fontSize: 13 }} />
        <Text style={{ fontSize: 13, color: 'rgba(43,40,37,0.5)' }}>
          {project.createTime ? dayjs(project.createTime).format('YYYY-MM-DD') : '—'}
        </Text>
      </div>
    </div>
  );
}
