import type { ProjectStatus } from './project';

/** 项目预览卡片，匹配 ProjectPreview.java */
export interface ProjectPreview {
  id: number;
  name: string;
  description: string;
  ownerName: string;
  memberCount: number;
  listCount: number;
  taskCount: number;
  isPublic: boolean;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  createTime: string;
}

/** Dashboard 概览响应，匹配 DashboardResponse.java */
export interface DashboardData {
  totalProjects: number;
  totalUsers: number;
  totalTasks: number;
  projects: ProjectPreview[];
  totalPublicProjects: number;
  publicProjects: ProjectPreview[];
}
