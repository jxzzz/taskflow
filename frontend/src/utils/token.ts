const TOKEN_KEY = 'taskflow_token';

/** 获取存储的 JWT token */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** 存储 JWT token */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** 清除 JWT token */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
