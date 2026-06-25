import client from './client';
import type { MemberInfo, AddMemberRequest, UpdateMemberRoleRequest } from '@/types/member';

export const memberApi = {
  /** GET /api/v1/projects/{projectId}/members */
  list: (projectId: number) =>
    client.get<any, MemberInfo[]>(`/projects/${projectId}/members`),

  /** POST /api/v1/projects/{projectId}/members */
  add: (projectId: number, data: AddMemberRequest) =>
    client.post<any, void>(`/projects/${projectId}/members`, data),

  /** PUT /api/v1/projects/{projectId}/members/{userId} */
  updateRole: (projectId: number, userId: number, data: UpdateMemberRoleRequest) =>
    client.put<any, void>(`/projects/${projectId}/members/${userId}`, data),

  /** DELETE /api/v1/projects/{projectId}/members/{userId} */
  remove: (projectId: number, userId: number) =>
    client.delete<any, void>(`/projects/${projectId}/members/${userId}`),
};
