import { Layout, Avatar, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { ROUTES } from '@/router/routes';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header() {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const dropdownItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息', onClick: () => navigate(ROUTES.SETTINGS) },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true,
      onClick: () => { queryClient.clear(); logout(); navigate(ROUTES.LOGIN, { replace: true }); } },
  ];

  const initials = user?.username?.slice(0, 1).toUpperCase() || '?';

  return (
    <AntHeader style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', background: 'var(--color-bg-base)', borderBottom: '1px solid var(--color-border-subtle)',
      height: 56,
    }}>
      {/* Sidebar toggle */}
      <span onClick={toggleSidebar}
        style={{ cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--color-ink-tertiary)', fontSize: 17, lineHeight: 1 }}>
        {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </span>

      {/* User area */}
      <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" trigger={['click']}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          padding: '6px 16px 6px 6px', borderRadius: 50,
          transition: 'background 150ms ease',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Avatar size={32} src={user?.avatar || undefined} style={{ backgroundColor: 'var(--color-lavender-soft)', color: 'var(--color-lavender)', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
            {initials}
          </Avatar>
          <Text style={{ color: 'var(--color-ink-primary)', fontSize: 13.5, fontWeight: 500, lineHeight: '32px' }}>
            {user?.username || '用户'}
          </Text>
        </div>
      </Dropdown>
    </AntHeader>
  );
}
