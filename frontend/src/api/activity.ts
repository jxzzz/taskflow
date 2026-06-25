import client from './client';
import type { ActivityLogEntry } from '@/types/activity';
import type { PaginatedResult } from '@/types/api';

export const activityApi = {
  /** GET /api/v1/activities?page=&size= */
  getList: (params: { page?: number; size?: number }) =>
    client.get<any, PaginatedResult<ActivityLogEntry>>('/activities', { params }),
};
