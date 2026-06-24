/** 通用 API 响应封装，匹配后端 ApiResponse.java */
export interface ApiResponse<T> {
  /** 状态码，200 表示成功 */
  code: number;
  /** 提示消息 */
  message: string;
  /** 业务数据 */
  data: T;
}

/** 分页结果，匹配 MyBatis-Plus IPage<T> */
export interface PaginatedResult<T> {
  /** 当前页记录列表 */
  records: T[];
  /** 总记录数 */
  total: number;
  /** 每页大小 */
  size: number;
  /** 当前页码 */
  current: number;
  /** 总页数 */
  pages: number;
}

/** 业务错误，当 ApiResponse.code !== 200 时抛出 */
export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}
