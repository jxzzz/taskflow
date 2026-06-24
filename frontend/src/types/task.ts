/** 卡片简要信息，嵌套在列表下 */
export interface TaskCardBrief {
  id: number;
  title: string;
  priority: number;           // 0=普通, 1=紧急, 2=非常紧急
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  sortOrder: number;
  labelCount: number;
}

/** 列表摘要（含卡片），匹配 TaskListSummary.java */
export interface TaskListSummary {
  id: number;
  name: string;
  sortOrder: number;
  taskCount: number;
  tasks: TaskCardBrief[];
}

/** 卡片详情，匹配 TaskResponse.java */
export interface TaskDetail {
  id: number;
  listId: number;
  listName: string;
  title: string;
  priority: number;
  priorityLabel: string;      // "普通"/"紧急"/"非常紧急"
  content?: string;
  assigneeId?: number;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  isOverdue: boolean;
  coverColor?: string;
  coverImage?: string;
  sortOrder: number;
  labelCount: number;
  checklistCount: number;
  completedChecklistCount: number;
  commentCount: number;
  attachmentCount: number;
  createTime: string;
  updateTime: string;
}

/** 创建卡片请求，匹配 TaskCreateRequest.java */
export interface CreateTaskRequest {
  title: string;
  content?: string;
  assigneeId?: number;
  priority?: number;
  dueDate?: string;
}

/** 更新卡片请求，匹配 TaskUpdateRequest.java */
export interface UpdateTaskRequest {
  title?: string;
  content?: string;
  assigneeId?: number | null;
  priority?: number;
  dueDate?: string | null;
}

/** 移动卡片请求，匹配 TaskMoveRequest.java */
export interface MoveTaskRequest {
  targetListId: number;
  sortOrder: number;
}

/** 排序项，匹配 ReorderItem.java */
export interface ReorderItem {
  id: number;
  sortOrder: number;
}
