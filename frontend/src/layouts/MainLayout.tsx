import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, ProjectOutlined, UserOutlined } from '@ant-design/icons';
import Header from './Header';
import { useAppStore } from '@/stores/appStore';
import { ROUTES } from '@/router/routes';
import type { MenuProps } from 'antd';

const { Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  { key: ROUTES.DASHBOARD, icon: <DashboardOutlined />, label: '控制台' },
  { key: ROUTES.PROJECTS, icon: <ProjectOutlined />, label: '项目' },
  { key: ROUTES.USERS, icon: <UserOutlined />, label: '用户' },
];

export default function MainLayout() {
  const { sidebarCollapsed } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = '/' + (location.pathname.split('/')[1] || 'dashboard');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={248}
        collapsedWidth={68}
        style={{
          background: 'var(--color-bg-base)',
          borderRight: '1px solid var(--color-border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: sidebarCollapsed ? '0' : '0 22px',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          {/* Flower/leaf mark */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#9b97d4" fillOpacity="0.12" />
            <circle cx="14" cy="10" r="3" stroke="#9b97d4" strokeWidth="1.6" />
            <path d="M14 13v8" stroke="#9b97d4" strokeWidth="1.6" strokeLinecap="round" />
            <path
              d="M10 19l4-3 4 3"
              stroke="#9b97d4"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!sidebarCollapsed && (
            <span
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: 20,
                fontWeight: 600,
                color: '#9b97d4',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              TaskFlow
            </span>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderInlineEnd: 'none', padding: '16px 6px' }}
        />
      </Sider>

      <Layout>
        <Header />
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-deep)' }}>
          <div style={{ padding: '28px clamp(24px, 6vw, 160px)', margin: '0 auto' }}>
            <Content>
              <Outlet />
            </Content>
          </div>
        </div>
      </Layout>
    </Layout>
  );
}
