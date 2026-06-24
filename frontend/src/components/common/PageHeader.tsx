import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  breadcrumb?: { title: string; path?: string }[];
  extra?: React.ReactNode;
}

/** 页面标题 + 面包屑 + 操作区 */
export default function PageHeader({ title, breadcrumb, extra }: PageHeaderProps) {
  const items = breadcrumb?.map((item) =>
    item.path
      ? { title: <Link to={item.path}>{item.title}</Link> }
      : { title: item.title },
  );

  return (
    <div
      style={{
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <div>
        {breadcrumb && (
          <Breadcrumb
            items={[
              { title: <Link to="/dashboard"><HomeOutlined /></Link> },
              ...(items || []),
            ]}
            style={{ marginBottom: 8 }}
          />
        )}
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
