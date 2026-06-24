import client from './client';
import type { UserInfo } from '@/types/auth';
import type { UserUpdateRequest } from '@/types/user';
import type { PaginatedResult } from '@/types/api';

/** 用户管理 API，匹配后端 UserController */
export const userApi = {
  /** 分页查看用户列表，GET /api/v1/users?page=1&size=20 */
  list: (page = 1, size = 20) =>
    client.get<any, PaginatedResult<UserInfo>>('/users', { params: { page, size } }),

  /** 查看用户详情，GET /api/v1/users/{id} */
  getById: (id: number) =>
    client.get<any, UserInfo>(`/users/${id}`),

  /** 修改用户信息，PUT /api/v1/users/{id} */
  update: (id: number, data: UserUpdateRequest) =>
    client.put<any, UserInfo>(`/users/${id}`, data),

  /** 删除用户（硬删除），DELETE /api/v1/users/{id} */
  delete: (id: number) =>
    client.delete<any, void>(`/users/${id}`),
};
