import client from './client';
import type { DashboardData } from '@/types/dashboard';

/** 工作台 API，匹配后端 DashboardController */
export const dashboardApi = {
  /** 获取工作台概览，GET /api/v1/dashboard */
  getOverview: () => client.get<any, DashboardData>('/dashboard'),
};
