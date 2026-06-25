import client from './client';
import type { LoginResponse, LoginRequest, RegisterRequest, UserInfo } from '@/types/auth';

/** 认证相关 API，匹配后端 AuthController */
export const authApi = {
  /** 登录，POST /api/v1/auth/login */
  login: (data: LoginRequest) =>
    client.post<any, LoginResponse>('/auth/login', data),

  /** 注册，POST /api/v1/auth/register */
  register: (data: RegisterRequest) =>
    client.post<any, UserInfo>('/auth/register', data),

  /** 获取当前登录用户（用于页面刷新恢复登录态），GET /api/v1/auth/me */
  getMe: () =>
    client.get<any, UserInfo>('/auth/me'),
};
