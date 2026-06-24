import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import AuthGuard from './AuthGuard';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import PageLoading from '@/components/common/PageLoading';
import { ROUTES } from './routes';

// 懒加载页面组件
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const UserListPage = lazy(() => import('@/pages/users/UserListPage'));
const ProjectListPage = lazy(() => import('@/pages/projects/ProjectListPage'));
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'));

/** 路由树 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },

  // 认证路由（无布局）
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

  // 主布局路由（需登录）
  {
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: <PageLoading><DashboardPage /></PageLoading>,
      },
      {
        path: 'projects',
        element: <PageLoading><ProjectListPage /></PageLoading>,
      },
      {
        path: 'projects/:id',
        element: <PageLoading><ProjectDetailPage /></PageLoading>,
      },
      {
        path: 'users',
        element: <PageLoading><UserListPage /></PageLoading>,
      },
      {
        path: 'settings',
        element: (
          <PageLoading>
            <div style={{ padding: 40, textAlign: 'center' }}>设置页面（待开发）</div>
          </PageLoading>
        ),
      },
    ],
  },

  // 404 兜底
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);
