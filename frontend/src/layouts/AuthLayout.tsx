import { Outlet } from 'react-router-dom';
import { Layout, Typography, theme } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

/** 认证页面布局：居中卡片 + Logo + 背景 */
export default function AuthLayout() {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgLayout} 100%)`,
      }}
    >
      <div style={{ width: 400, maxWidth: '90vw' }}>
        {/* Logo & 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ThunderboltOutlined
            style={{ fontSize: 48, color: token.colorPrimary, marginBottom: 12 }}
          />
          <Title level={2} style={{ margin: 0 }}>
            TaskFlow
          </Title>
          <Text type="secondary">高效团队任务管理平台</Text>
        </div>

        {/* 卡片内容 */}
        <div
          style={{
            background: token.colorBgContainer,
            padding: 32,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <Content>
            <Outlet />
          </Content>
        </div>
      </div>
    </div>
  );
}
