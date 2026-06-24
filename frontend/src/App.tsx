import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import { RouterProvider } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { router } from '@/router';

// dayjs 全局中文
dayjs.locale('zh-cn');

/** TanStack Query 客户端 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 分钟
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 6,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
          },
        }}
      >
        <AntApp>
          <RouterProvider router={router} />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
