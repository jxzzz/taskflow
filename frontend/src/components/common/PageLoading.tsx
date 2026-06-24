import { Suspense } from 'react';
import { Spin } from 'antd';

/** 页面加载中占位 */
function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spin size="large" />
    </div>
  );
}

/** Suspense 包装器，用于懒加载页面 */
export default function PageLoading({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
