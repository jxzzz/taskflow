import { Outlet } from 'react-router-dom';
import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `
        radial-gradient(ellipse 60% 40% at 50% -8%, rgba(155,151,212,0.06) 0%, transparent 55%),
        radial-gradient(ellipse 40% 30% at 90% 90%, rgba(232,160,156,0.05) 0%, transparent 50%),
        #f6f4f0
      `,
      padding: 24,
    }}>
      <div style={{ width: 420, maxWidth: '100%' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#9b97d4" fillOpacity="0.12" />
            <circle cx="14" cy="10" r="3" stroke="#9b97d4" strokeWidth="1.6" />
            <path d="M14 13v8" stroke="#9b97d4" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M10 19l4-3 4 3" stroke="#9b97d4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Title level={2} style={{ margin: '12px 0 0', fontWeight: 600, fontSize: 28, fontFamily: "'Newsreader', Georgia, serif", color: '#2b2825' }}>
            TaskFlow
          </Title>
          <Text style={{ color: 'rgba(43,40,37,0.45)', fontSize: 13.5 }}>高效团队任务管理平台</Text>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff', borderRadius: 24, padding: 36,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}>
          <Outlet />
        </div>

        <Text style={{ display: 'block', textAlign: 'center', marginTop: 24, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(43,40,37,0.22)' }}>
          TaskFlow &copy; {new Date().getFullYear()}
        </Text>
      </div>
    </div>
  );
}
