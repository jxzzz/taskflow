import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

/** 路由守卫：未登录时重定向到登录页，附带 returnUrl 参数 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?returnUrl=${returnUrl}`} replace />;
  }

  return <>{children}</>;
}
