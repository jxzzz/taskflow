/** Task 相关类型，后续开发时补充 */
export interface Task {
  id: number;
  title: string;
  content?: string;
  listId: number;
  assigneeId?: number;
  assigneeName?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  sortOrder: number;
  deleted: boolean;
  createTime: string;
  updateTime: string;
}

export interface TaskList {
  id: number;
  name: string;
  projectId: number;
  sortOrder: number;
  createTime: string;
}

export interface CreateTaskRequest {
  title: string;
  content?: string;
  listId: number;
  assigneeId?: number;
  priority?: Task['priority'];
}

export interface UpdateTaskRequest {
  title?: string;
  content?: string;
  assigneeId?: number;
  priority?: Task['priority'];
}

export interface MoveTaskRequest {
  targetListId: number;
  sortOrder: number;
}
