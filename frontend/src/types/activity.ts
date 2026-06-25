/** 操作活动类型 */
export type ActivityActionType =
  | 'PROJECT_CREATE'
  | 'PROJECT_UPDATE'
  | 'PROJECT_DELETE'
  | 'TASK_CREATE'
  | 'TASK_UPDATE'
  | 'TASK_DELETE'
  | 'TASK_MOVE'
  | 'LIST_CREATE'
  | 'LIST_DELETE'
  | 'MEMBER_ADD'
  | 'MEMBER_REMOVE'
  | 'MEMBER_ROLE_CHANGE'
  | 'CHECKLIST_ADD'
  | 'CHECKLIST_DELETE';

/** 活动日志条目，匹配后端 ActivityLogResponse.java */
export interface ActivityLogEntry {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  username: string;
  actionType: ActivityActionType;
  entityType: 'PROJECT' | 'TASK' | 'TASK_LIST' | 'MEMBER' | 'CHECKLIST';
  entityId?: number;
  entityName?: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  createTime: string;
}

/** 按 actionType 映射颜色和图标 */
export const ACTIVITY_ACTION_CONFIG: Record<
  string,
  { color: string; label: string }
> = {
  PROJECT_CREATE: { color: '#52c41a', label: '创建项目' },
  PROJECT_UPDATE: { color: '#1677ff', label: '更新项目' },
  PROJECT_DELETE: { color: '#ff4d4f', label: '删除项目' },
  TASK_CREATE: { color: '#52c41a', label: '创建任务' },
  TASK_UPDATE: { color: '#1677ff', label: '更新任务' },
  TASK_DELETE: { color: '#ff4d4f', label: '删除任务' },
  TASK_MOVE: { color: '#fa8c16', label: '移动任务' },
  LIST_CREATE: { color: '#52c41a', label: '创建列表' },
  LIST_DELETE: { color: '#ff4d4f', label: '删除列表' },
  MEMBER_ADD: { color: '#52c41a', label: '加入成员' },
  MEMBER_REMOVE: { color: '#ff4d4f', label: '移除成员' },
  MEMBER_ROLE_CHANGE: { color: '#722ed1', label: '角色变更' },
  CHECKLIST_ADD: { color: '#52c41a', label: '添加检查项' },
  CHECKLIST_DELETE: { color: '#ff4d4f', label: '删除检查项' },
};
