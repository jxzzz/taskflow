import { Outlet } from 'react-router-dom';
import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f6f5f4',
      padding: 24,
    }}>
      <div style={{ width: 420, maxWidth: '100%' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#0075de" fillOpacity="0.10" />
            <circle cx="14" cy="10" r="3" stroke="#0075de" strokeWidth="1.6" />
            <path d="M14 13v8" stroke="#0075de" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M10 19l4-3 4 3" stroke="#0075de" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Title level={2} style={{ margin: '12px 0 0', fontWeight: 700, fontSize: 28, fontFamily: "'Inter', -apple-system, 'system-ui', 'Segoe UI', Helvetica, Arial, sans-serif", color: '#000000' }}>
            TaskFlow
          </Title>
          <Text style={{ color: 'var(--color-ink-tertiary)', fontSize: 13.5 }}>高效团队任务管理平台</Text>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff', borderRadius: 16, padding: 36,
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border-default)',
        }}>
          <Outlet />
        </div>

        <Text style={{ display: 'block', textAlign: 'center', marginTop: 24, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-ink-disabled)' }}>
          TaskFlow &copy; {new Date().getFullYear()}
        </Text>
      </div>
    </div>
  );
}
