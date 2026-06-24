import client from './client';
import type {
  TaskListSummary,
  TaskDetail,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  ReorderItem,
} from '@/types/task';
import type { PaginatedResult } from '@/types/api';

/** 任务列表 API */
export const taskListApi = {
  /** 创建列表，POST /api/v1/projects/{projectId}/lists */
  create: (projectId: number, data: { name: string }) =>
    client.post<any, TaskListSummary>(`/projects/${projectId}/lists`, data),

  /** 获取看板下所有列表，GET /api/v1/projects/{projectId}/lists */
  list: (projectId: number) =>
    client.get<any, TaskListSummary[]>(`/projects/${projectId}/lists`),

  /** 更新列表，PUT /api/v1/projects/{projectId}/lists/{id} */
  update: (projectId: number, id: number, data: { name: string }) =>
    client.put<any, TaskListSummary>(`/projects/${projectId}/lists/${id}`, data),

  /** 删除列表，DELETE /api/v1/projects/{projectId}/lists/{id} */
  delete: (projectId: number, id: number) =>
    client.delete<any, void>(`/projects/${projectId}/lists/${id}`),

  /** 列表排序，PUT /api/v1/projects/{projectId}/lists/reorder */
  reorder: (projectId: number, items: ReorderItem[]) =>
    client.put<any, void>(`/projects/${projectId}/lists/reorder`, items),
};

/** 任务卡片 API */
export const taskApi = {
  /** 创建卡片，POST /api/v1/lists/{listId}/tasks */
  create: (listId: number, data: CreateTaskRequest) =>
    client.post<any, TaskDetail>(`/lists/${listId}/tasks`, data),

  /** 获取列表下卡片，GET /api/v1/lists/{listId}/tasks */
  list: (listId: number, page = 1, size = 20) =>
    client.get<any, PaginatedResult<TaskDetail>>(`/lists/${listId}/tasks`, { params: { page, size } }),

  /** 获取卡片详情，GET /api/v1/tasks/{id} */
  getById: (id: number) =>
    client.get<any, TaskDetail>(`/tasks/${id}`),

  /** 更新卡片，PUT /api/v1/tasks/{id} */
  update: (id: number, data: UpdateTaskRequest) =>
    client.put<any, TaskDetail>(`/tasks/${id}`, data),

  /** 删除卡片，DELETE /api/v1/tasks/{id} */
  delete: (id: number) =>
    client.delete<any, void>(`/tasks/${id}`),

  /** 移动卡片，PUT /api/v1/tasks/{id}/move */
  move: (id: number, data: MoveTaskRequest) =>
    client.put<any, TaskDetail>(`/tasks/${id}/move`, data),

  /** 卡片排序，PUT /api/v1/lists/{listId}/tasks/reorder */
  reorder: (listId: number, items: ReorderItem[]) =>
    client.put<any, void>(`/lists/${listId}/tasks/reorder`, items),
};
