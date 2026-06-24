import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';

/** 工作台概览数据 */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getOverview(),
    staleTime: 60 * 1000, // 1 分钟内不重复请求
  });
}
