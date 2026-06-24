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
        <Title level={4} style={{ margin: 0, fontFamily: "'Newsreader', Georgia, serif", fontWeight: 500, fontSize: 24, color: '#2b2825' }}>
          {title}
        </Title>
        {subtitle && <Typography.Text style={{ color: 'rgba(43,40,37,0.45)', fontSize: 13.5, display: 'block', marginTop: 4 }}>{subtitle}</Typography.Text>}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
