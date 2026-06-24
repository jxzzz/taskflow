import { Card, Col, Row, Typography, Statistic, Spin } from 'antd';
import {
  ProjectOutlined,
  UserOutlined,
  CheckSquareOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { useUsers } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { ROUTES } from '@/router/routes';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { data: usersData, isFetching: usersLoading } = useUsers(1, 1);
  const { data: projectsData, isFetching: projectsLoading } = useProjects(1, 1);

  const userCount = usersData?.total || 0;
  const projectCount = projectsData?.total || 0;

  return (
    <div>
      <PageHeader title="控制台" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="用户数"
              value={usersLoading ? undefined : userCount}
              prefix={<UserOutlined />}
              suffix={usersLoading ? <Spin size="small" /> : undefined}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Link to={ROUTES.PROJECTS} style={{ textDecoration: 'none' }}>
            <Card hoverable>
              <Statistic
                title="看板数"
                value={projectsLoading ? undefined : projectCount}
                prefix={<ProjectOutlined />}
                suffix={projectsLoading ? <Spin size="small" /> : undefined}
              />
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="任务数"
              value={0}
              prefix={<CheckSquareOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <ThunderboltOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
          <Title level={4}>欢迎使用 TaskFlow</Title>
          <Text type="secondary">
            TaskFlow 是一个高效的团队任务管理平台。通过看板管理项目，拖拽分配任务，轻松协作。
          </Text>
        </div>
      </Card>
    </div>
  );
}
