import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Tag, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import { useProject } from '@/hooks/useProjects';

const { Text } = Typography;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(Number(id));

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return <Text type="secondary">看板不存在</Text>;
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        breadcrumb={[
          { title: '看板', path: '/projects' },
          { title: project.name },
        ]}
      />

      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
          返回
        </Button>
        <Button type="primary" icon={<EditOutlined />}>
          编辑
        </Button>
      </Space>

      <Card title="看板信息">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="看板 ID">{project.id}</Descriptions.Item>
          <Descriptions.Item label="创建者">
            <Tag color="blue">{project.ownerName || `用户 #${project.ownerId}`}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="成员数">{project.memberCount}</Descriptions.Item>
          <Descriptions.Item label="列表数">{project.listCount}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {project.description || <Text type="secondary">暂无描述</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {project.createTime ? dayjs(project.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 后续阶段：在此添加任务列表和任务卡片的看板视图 */}
      <Card title="任务看板" style={{ marginTop: 16 }}>
        <Text type="secondary">任务看板功能将在下个阶段实现</Text>
      </Card>
    </div>
  );
}
