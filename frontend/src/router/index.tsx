import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import AuthGuard from './AuthGuard';
import AuthLayout from '@/layouts/AuthLayout';
import PageLoading from '@/components/common/PageLoading';
import { ROUTES } from './routes';

// 懒加载页面组件
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

/** 路由树 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.LOGIN} replace /> },
      {
        path: 'login',
        element: <PageLoading><LoginPage /></PageLoading>,
      },
      {
        path: 'register',
        element: <PageLoading><RegisterPage /></PageLoading>,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <PageLoading><DashboardPage /></PageLoading>
      </AuthGuard>
    ),
  },
  // 后续阶段添加 /projects、/users 等受保护路由
]);
