import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Header from './Header';
import { useAppStore } from '@/stores/appStore';
import { ROUTES } from '@/router/routes';
import type { MenuProps } from 'antd';

const { Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: ROUTES.DASHBOARD,
    icon: <DashboardOutlined />,
    label: '控制台',
  },
  {
    key: ROUTES.PROJECTS,
    icon: <ProjectOutlined />,
    label: '看板',
  },
  {
    key: ROUTES.USERS,
    icon: <UserOutlined />,
    label: '用户管理',
  },
];

export default function MainLayout() {
  const { sidebarCollapsed } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 获取当前选中的菜单项
  const selectedKey = '/' + (location.pathname.split('/')[1] || 'dashboard');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={240}
        style={{
          background: '#001529',
          borderRight: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: sidebarCollapsed ? 16 : 20,
            fontWeight: 700,
            letterSpacing: 1,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {sidebarCollapsed ? 'TF' : 'TaskFlow'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header />
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
