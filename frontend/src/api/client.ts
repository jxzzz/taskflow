import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api';
import { ApiError } from '@/types/api';
import { getToken, removeToken } from '@/utils/token';

/** Axios 实例，baseURL 指向后端 API 前缀 */
const client = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * 请求拦截器 — 自动注入 JWT token
 * 匹配后端 JwtAuthenticationFilter 的 Bearer 前缀
 */
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 响应拦截器
 * - 解包 ApiResponse<T> 的 data 字段，调用方直接拿到类型化数据
 * - code !== 200 抛出 ApiError
 * - HTTP 401 清除 token 并跳转登录页
 *
 * 类型说明：axios 拦截器要求返回 AxiosResponse，此处故意解包只返回 data，
 * 故使用 any 类型断言。API 函数使用泛型标注实际返回类型。
 */
function onResponseFulfilled(response: AxiosResponse) {
  const body = response.data as ApiResponse<unknown>;
  if (body.code !== 200) {
    throw new ApiError(body.code, body.message);
  }
  return body.data;
}

function onResponseRejected(error: AxiosError) {
  if (error.response?.status === 401) {
    removeToken();
    if (!window.location.pathname.startsWith('/auth')) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth/login?returnUrl=${returnUrl}`;
    }
    return Promise.reject(error);
  }

  // Extract backend error message from response body
  const body = error.response?.data as ApiResponse<unknown> | undefined;
  if (body?.message) {
    return Promise.reject(new ApiError(body.code ?? error.response!.status, body.message));
  }

  return Promise.reject(error);
}

client.interceptors.response.use(onResponseFulfilled as any, onResponseRejected);

export default client;
