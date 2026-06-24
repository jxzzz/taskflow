import { Card, Col, Row, Typography, Statistic } from 'antd';
import { ProjectOutlined, UserOutlined, CheckSquareOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';

const { Title } = Typography;

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="控制台" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="项目数" value={0} prefix={<ProjectOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="任务数" value={0} prefix={<CheckSquareOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="成员数" value={0} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Title level={5}>欢迎使用 TaskFlow</Title>
        <p>TaskFlow 是一个高效的团队任务管理平台，帮助你轻松管理项目和任务。</p>
      </Card>
    </div>
  );
}
