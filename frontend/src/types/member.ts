/** 项目成员信息 */
export interface MemberInfo {
  userId: number;
  username: string;
  avatar: string | null;
  role: 0 | 1; // 0=普通成员, 1=管理员
  joinTime: string;
}

/** 添加成员请求 */
export interface AddMemberRequest {
  userId: number;
  role?: number;
}

/** 更新成员角色请求 */
export interface UpdateMemberRoleRequest {
  role: number;
}
