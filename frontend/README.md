# TaskFlow Frontend

基于 **React 19 + TypeScript 6 + Vite 8** 的任务管理平台前端，提供看板管理、用户管理和团队协作功能。

## 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 框架 | React 19 | 函数组件 + Hooks |
| 语言 | TypeScript 6 (strict) | 全量类型覆盖 |
| 构建 | Vite 8 | HMR 开发 + Rolldown 生产构建 |
| 路由 | React Router 7 | lazy loading + 路由守卫 |
| 客户端状态 | Zustand 5 | token、用户信息、UI 状态 |
| 服务端状态 | TanStack Query 5 | 缓存、分页、乐观更新 |
| HTTP | Axios 1.18 | 拦截器统一处理 token 和错误 |
| UI 组件 | Ant Design 6 | 中文企业级组件库 |
| 拖拽 | @dnd-kit | 看板任务拖拽（后续阶段） |
| 日期 | dayjs | 轻量级日期处理 |
| 代码质量 | oxlint + Prettier | Rust 实现的快速 Linter |
| 测试 | Vitest + Testing Library | Vite 原生测试框架 |

## 项目结构

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/                     # API 层（纯函数，调用后端）
│   │   ├── client.ts            # Axios 实例 + 拦截器
│   │   ├── auth.ts              # 认证接口
│   │   ├── users.ts             # 用户管理接口
│   │   └── projects.ts          # 看板管理接口
│   │
│   ├── stores/                  # Zustand 客户端状态
│   │   ├── authStore.ts         # token、user、isAuthenticated
│   │   └── appStore.ts          # sidebar 折叠、主题
│   │
│   ├── hooks/                   # TanStack Query Hooks
│   │   ├── useAuth.ts           # useLogin / useRegister
│   │   ├── useUsers.ts          # useUsers / useDeleteUser / useUpdateUser
│   │   └── useProjects.ts       # useProjects / useCreateProject / useDeleteProject
│   │
│   ├── router/                  # 路由配置
│   │   ├── index.tsx            # 路由树（createBrowserRouter）
│   │   ├── AuthGuard.tsx        # 登录鉴权守卫
│   │   └── routes.ts            # 路径常量
│   │
│   ├── layouts/                 # 布局组件
│   │   ├── MainLayout.tsx       # Sider + Header + Content
│   │   ├── AuthLayout.tsx       # 居中卡片（登录/注册）
│   │   └── Header.tsx           # 顶栏（折叠按钮 + 用户下拉菜单）
│   │
│   ├── pages/                   # 页面组件
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── projects/
│   │   │   ├── ProjectListPage.tsx
│   │   │   └── ProjectDetailPage.tsx
│   │   ├── users/
│   │   │   └── UserListPage.tsx
│   │   └── tasks/               # 任务看板（后续阶段）
│   │
│   ├── components/              # 共享组件
│   │   ├── common/
│   │   │   ├── PageHeader.tsx   # 页面标题 + 面包屑 + 操作区
│   │   │   ├── PageLoading.tsx  # Suspense + Spin
│   │   │   └── ErrorBoundary.tsx
│   │   └── business/
│   │
│   ├── types/                   # TypeScript 类型（匹配后端 DTO）
│   │   ├── api.ts               # ApiResponse<T>, PaginatedResult<T>, ApiError
│   │   ├── auth.ts              # LoginRequest, LoginResponse, UserInfo
│   │   ├── user.ts              # UserUpdateRequest
│   │   ├── project.ts           # Project, CreateProjectRequest, UpdateProjectRequest
│   │   └── task.ts              # Task, TaskList, CreateTaskRequest
│   │
│   ├── utils/
│   │   ├── token.ts             # getToken / setToken / removeToken
│   │   └── constants.ts         # API_BASE, 分页默认值, 布局尺寸
│   │
│   ├── styles/
│   │   ├── variables.css        # CSS 自定义属性
│   │   └── global.css           # CSS Reset + 滚动条
│   │
│   ├── App.tsx                  # 根组件（QueryClient + ConfigProvider + Router）
│   └── main.tsx                 # 入口
│
├── Dockerfile                   # 多阶段构建（node → nginx）
├── nginx.conf                   # SPA fallback + /api 反向代理
├── vite.config.ts               # 别名 + 代理 + vendor 分包
├── tsconfig.json
└── package.json
```

## 架构设计

### 数据流分层

```
React Components (pages / components / layouts)
    ↕ 通过 hooks 消费
TanStack Query Hooks (useQuery / useMutation)
    ↕ 调用 API 函数
api/* 纯函数 (axios client)
    ↕ HTTP 请求
Spring Boot Backend (/api/v1/*)
```

**关键设计原则：**
- `api/` 层是纯函数，返回类型化数据，可独立测试
- `hooks/` 层包装缓存、loading/error 状态，组件无需关心请求细节
- `stores/`（Zustand）仅存客户端状态（token、sidebar），**不复制服务端数据**
- 服务端数据完全由 TanStack Query 管理（缓存、失效、乐观更新）

### Axios 拦截器

```
请求拦截：自动从 localStorage 读取 token → Authorization: Bearer xxx
响应拦截：
  ├── code === 200 → 解包 ApiResponse，返回 data
  ├── code !== 200 → 抛出 ApiError（含 message）
  └── HTTP 401     → 清除 token → 跳转 /auth/login?returnUrl=xxx
```

### 认证流程

```
LoginPage
  → Form submit
  → useLogin mutation → POST /api/v1/auth/login
  → 拦截器解包 → 拿到 LoginResponse { token, user }
  → authStore.login(token, user)
  → localStorage.setItem('taskflow_token', token)
  → message.success()
  → navigate(returnUrl || '/dashboard')

后续请求：拦截器自动注入 Authorization header
Token 过期：401 → 清除 token → 跳转登录页
路由守卫：未登录访问 /dashboard → AuthGuard → Navigate to /auth/login
```

## 路由设计

```
/auth → AuthLayout（居中卡片 + 渐变背景）
  /auth/login     → LoginPage      [公开]
  /auth/register  → RegisterPage   [公开]

/ → MainLayout（需登录 AuthGuard）
  /dashboard      → DashboardPage       [Token]
  /projects       → ProjectListPage     [Token]
  /projects/:id   → ProjectDetailPage   [Token]
  /users          → UserListPage        [Token]
  /settings       → 设置页（占位）       [Token]
  *               → 重定向 /dashboard
```

## API 覆盖

| 后端 API | 前端函数 | 状态 |
|---|---|---|
| `POST /api/v1/auth/register` | `authApi.register()` | ✅ |
| `POST /api/v1/auth/login` | `authApi.login()` | ✅ |
| `GET /api/v1/users?page&size` | `userApi.list()` | ✅ |
| `GET /api/v1/users/{id}` | `userApi.getById()` | ✅ |
| `PUT /api/v1/users/{id}` | `userApi.update()` | ✅ |
| `DELETE /api/v1/users/{id}` | `userApi.delete()` | ✅ |
| `POST /api/v1/projects` | `projectApi.create()` | ✅ |
| `GET /api/v1/projects` | `projectApi.list()` | ✅ |
| `GET /api/v1/projects/{id}` | `projectApi.getById()` | ✅ |
| `PUT /api/v1/projects/{id}` | `projectApi.update()` | ✅ |
| `DELETE /api/v1/projects/{id}` | `projectApi.delete()` | ✅ |

## 数据模型

```
Project (看板)              ← /api/v1/projects
  ├── TaskList (列/泳道)     ← 后端已建模，API 待开放
  │     ├── Task (任务卡片)  ← 后端已建模，API 待开放
  │     └── Task
  └── TaskList
        └── Task
```

- **看板（Project）**：顶层容器，包含名称、描述、创建者、成员、列表数
- **列表（TaskList）**：看板中的列，如"待办""进行中""已完成"
- **任务（Task）**：列表中的卡片，支持标题、内容、负责人、优先级、拖拽排序

## 本地开发

### 前提条件

- Node.js >= 20
- Docker（运行后端基础设施）

### 启动步骤

```bash
# 1. 启动后端基础设施（MySQL、Redis、RabbitMQ、MinIO、Backend）
docker compose up -d

# 2. 进入前端目录
cd frontend

# 3. 安装依赖
npm install

# 4. 启动开发服务器（HMR，默认 http://localhost:5173）
npm run dev
```

Vite 自动将 `/api` 请求代理到 `http://localhost:8080`（后端），开发时无需处理 CORS。

### 可用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 类型检查 + 生产构建
npm run preview      # 预览生产构建
npm run lint         # 运行 oxlint 检查
npm run lint:fix     # 自动修复 lint 问题
npm run format       # Prettier 格式化
npm run format:check # 检查格式
npm run test         # 运行 Vitest 测试
npm run test:coverage # 测试覆盖率
npm run type-check   # TypeScript 类型检查
```

## 构建与部署

### Docker 多阶段构建

```dockerfile
# Stage 1: node:20-alpine → npm ci → npm run build
# Stage 2: nginx:1.27-alpine + dist + nginx.conf
```

### 生产架构

```
Browser (80)
  → nginx (frontend 容器)
      ├── /*      → 静态文件 (SPA, try_files fallback)
      └── /api/*  → proxy_pass http://backend:8080
```

nginx 反向代理消除生产环境 CORS，API 和静态资源同源。

### Docker Compose

```bash
# 本地部署（构建镜像）
docker compose up -d --build

# 生产部署（拉取 ACR 镜像）
docker compose -f docker-compose.al.prod.yml up -d
```

## 待实现

- [ ] 任务看板（TaskList + Task CRUD API + 拖拽 UI）
- [ ] 看板成员管理接口与 UI
- [ ] 文件上传页面（MinIO）
- [ ] 错误页面（404 / 403）
- [ ] 响应式布局适配
- [ ] ErrorBoundary 全局错误捕获
- [ ] 单元测试 + 集成测试
