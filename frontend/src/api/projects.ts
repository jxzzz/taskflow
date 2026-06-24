import client from './client';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project';
import type { PaginatedResult } from '@/types/api';

/** 看板管理 API，匹配后端 ProjectController */
export const projectApi = {
  /** 创建看板，POST /api/v1/projects */
  create: (data: CreateProjectRequest) =>
    client.post<any, Project>('/projects', data),

  /** 查看我参与的看板列表，GET /api/v1/projects */
  list: (page = 1, size = 20) =>
    client.get<any, PaginatedResult<Project>>('/projects', { params: { page, size } }),

  /** 查看看板详情，GET /api/v1/projects/{id} */
  getById: (id: number) =>
    client.get<any, Project>(`/projects/${id}`),

  /** 修改看板，PUT /api/v1/projects/{id}（仅 admin/owner） */
  update: (id: number, data: UpdateProjectRequest) =>
    client.put<any, Project>(`/projects/${id}`, data),

  /** 删除看板，DELETE /api/v1/projects/{id}（仅 owner） */
  delete: (id: number) =>
    client.delete<any, void>(`/projects/${id}`),
};
