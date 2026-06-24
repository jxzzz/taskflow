/** 登录请求，匹配 UserLoginRequest.java */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 注册请求，匹配 UserRegisterRequest.java */
export interface RegisterRequest {
  username: string;
  password: string;
  avatar?: string;
}

/** 用户信息，匹配 UserResponse.java */
export interface UserInfo {
  id: number;
  username: string;
  avatar: string | null;
  createTime: string; // LocalDateTime 序列化为 ISO 字符串
  updateTime: string;
}

/** 登录响应，匹配 LoginResponse.java */
export interface LoginResponse {
  token: string;
  user: UserInfo;
}
