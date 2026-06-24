/** 路由路径常量 */
export const ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  TASK_BOARD: '/projects/:id/tasks',
  USERS: '/users',
  SETTINGS: '/settings',
} as const;
