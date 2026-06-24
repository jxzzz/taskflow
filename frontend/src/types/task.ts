/** 卡片简要信息，嵌套在列表下 */
export interface TaskCardBrief {
  id: number;
  title: string;
  contentSnippet?: string;    // 内容摘要（前120字符）
  priority: number;           // 0=普通, 1=紧急, 2=非常紧急
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  isOverdue?: boolean;        // 是否已逾期
  coverColor?: string;        // 封面颜色(hex)
  sortOrder: number;
  completedChecklistCount: number;
  checklistCount: number;
  commentCount: number;
  labelCount: number;
  checklistItems?: ChecklistItem[];
}

/** 清单检查项 */
export interface ChecklistItem {
  id: number;
  taskId: number;
  title: string;
  completed: boolean;
  sortOrder: number;
  createTime: string;
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
  checklistItems?: ChecklistItem[];
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
  checklistItems?: string[];
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
