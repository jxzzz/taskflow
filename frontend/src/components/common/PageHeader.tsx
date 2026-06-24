import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  breadcrumb?: { title: string; path?: string }[];
}

/** 页面标题 + 面包屑组件 */
export default function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  const items = breadcrumb?.map((item) =>
    item.path
      ? { title: <a href={item.path}>{item.title}</a> }
      : { title: item.title },
  );

  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumb && (
        <Breadcrumb
          items={[{ title: <HomeOutlined />, path: '/dashboard' }, ...(items || [])]}
          style={{ marginBottom: 8 }}
        />
      )}
      <Title level={3} style={{ margin: 0 }}>
        {title}
      </Title>
    </div>
  );
}
