import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { title: string; path?: string }[];
  extra?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumb, extra }: PageHeaderProps) {
  const items = breadcrumb?.map((item) =>
    item.path ? { title: <Link to={item.path}>{item.title}</Link> } : { title: item.title },
  );

  return (
    <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <div>
        {breadcrumb && (
          <Breadcrumb items={[{ title: <Link to="/dashboard"><HomeOutlined /></Link> }, ...(items || [])]} style={{ marginBottom: 6 }} />
        )}
        <Title level={4} style={{ margin: 0, fontFamily: "'Inter', -apple-system, 'system-ui', 'Segoe UI', Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: 24, color: 'var(--color-ink-primary)' }}>
          {title}
        </Title>
        {subtitle && <Typography.Text style={{ color: 'var(--color-ink-tertiary)', fontSize: 13.5, display: 'block', marginTop: 4 }}>{subtitle}</Typography.Text>}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
