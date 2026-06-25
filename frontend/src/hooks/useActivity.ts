import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/api/activity';

export function useActivities(page = 1, size = 10) {
  return useQuery({
    queryKey: ['activities', { page, size }],
    queryFn: () => activityApi.getList({ page, size }),
    staleTime: 30 * 1000,
  });
}
