/** 用户信息（别名，与 auth.ts 中 UserInfo 一致） */
export type { UserInfo } from '@/types/auth';

/** 用户更新请求，匹配 UserUpdateRequest.java */
export interface UserUpdateRequest {
  username?: string;
  password?: string;
  avatar?: string;
}
