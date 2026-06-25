import type { TaskListSummary } from './task';

/** 项目状态 */
export type ProjectStatus = 'active' | 'completed' | 'archived';

/** 项目状态显示配置 */
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  active: { label: '进行中', color: 'blue' },
  completed: { label: '已完成', color: 'green' },
  archived: { label: '已归档', color: 'default' },
};

/** 项目信息，匹配 ProjectResponse.java */
export interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  listCount: number;
  projectUrl?: string;
  isPublic: boolean;
  isMember: boolean;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  createTime: string;
  /** 看板列表（含卡片），仅详情接口返回 */
  lists?: TaskListSummary[];
}

/** 创建项目请求，匹配 ProjectCreateRequest.java */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  projectUrl?: string;
  isPublic?: boolean;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

/** 更新项目请求，匹配 ProjectUpdateRequest.java */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  projectUrl?: string;
  isPublic?: boolean;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}
