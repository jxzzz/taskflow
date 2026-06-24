import type { TaskListSummary } from './task';

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
  createTime: string;
  /** 看板列表（含卡片），仅详情接口返回 */
  lists?: TaskListSummary[];
}

/** 创建项目请求，匹配 ProjectCreateRequest.java */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  projectUrl?: string;
}

/** 更新项目请求，匹配 ProjectUpdateRequest.java */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  projectUrl?: string;
}
