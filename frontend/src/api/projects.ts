import client from './client';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project';
import type { PaginatedResult } from '@/types/api';

/** 项目管理 API，匹配后端 ProjectController */
export const projectApi = {
  /** 创建项目，POST /api/v1/projects */
  create: (data: CreateProjectRequest) =>
    client.post<any, Project>('/projects', data),

  /** 查看我参与的项目列表，GET /api/v1/projects */
  list: (page = 1, size = 20) =>
    client.get<any, PaginatedResult<Project>>('/projects', { params: { page, size } }),

  /** 查看项目详情，GET /api/v1/projects/{id} */
  getById: (id: number) =>
    client.get<any, Project>(`/projects/${id}`),

  /** 修改项目，PUT /api/v1/projects/{id}（仅 admin/owner） */
  update: (id: number, data: UpdateProjectRequest) =>
    client.put<any, Project>(`/projects/${id}`, data),

  /** 删除项目，DELETE /api/v1/projects/{id}（仅 owner） */
  delete: (id: number) =>
    client.delete<any, void>(`/projects/${id}`),
};
