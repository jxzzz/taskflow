# TaskFlow

任务看板管理应用，支持多项目管理、拖拽排序、清单协作和文件附件。

## ✨ 功能

- **用户认证** — JWT 无状态登录/注册，页面刷新自动恢复会话
- **看板管理** — 创建项目看板，支持公开/私有，角色权限控制
- **任务卡片** — 拖拽排序、跨列移动、优先级、截止日期、指派成员
- **清单子任务** — 卡片内添加勾选清单，单独追踪完成状态
- **文件上传** — MinIO 对象存储，支持图片/附件
- **仪表盘** — 概览项目数、任务数、用户统计
- **国际化** — 中/英文切换，跟随系统或手动选择
- **主题切换** — 四套柔和色调，CSS 变量驱动

## 🛠️ 技术栈

### 后端

| 技术 | 说明 |
|---|---|
| Java 21 + Spring Boot 3.4 | RESTful API |
| MyBatis-Plus 3.5 | ORM / 分页 |
| MySQL 8.0 | 数据库 |
| Flyway | 数据库迁移 |
| Redis 7 | 缓存 |
| RabbitMQ 4.0 | 异步消息队列 |
| MinIO | 对象存储 |
| Spring Security + JWT | 认证鉴权 |
| Druid 1.2 | 连接池 + SQL 监控 |
| SpringDoc OpenAPI 2.7 | Swagger 文档 |

### 前端

| 技术 | 说明 |
|---|---|
| React 19 + TypeScript | UI 框架 |
| Vite 8 | 构建工具 |
| Ant Design 6 | 组件库 |
| TanStack React Query 5 | 服务端状态管理 |
| Zustand 5 | 客户端状态管理 |
| @dnd-kit | 拖拽交互 |
| React Router 7 | 路由 |
| Day.js | 日期处理 |

## 📁 项目结构

```
TaskFlow/
├── backend/                     # Spring Boot 后端
│   ├── src/main/java/com/taskflow/
│   │   ├── config/              # 配置类
│   │   ├── controller/          # REST 控制器
│   │   ├── service/             # 业务逻辑
│   │   ├── mapper/              # MyBatis-Plus Mapper
│   │   ├── entity/              # 实体类
│   │   ├── dto/                 # 请求/响应 DTO
│   │   ├── security/            # JWT 认证过滤器
│   │   ├── exception/           # 异常处理
│   │   └── utils/               # 工具类
│   └── src/main/resources/
│       ├── application.yml      # 主配置（Docker 环境）
│       ├── application-dev.yml  # 本地开发配置
│       └── db/migration/        # Flyway SQL 迁移脚本
├── frontend/                    # React + Vite 前端
│   ├── src/
│   │   ├── api/                 # API 客户端
│   │   ├── components/          # 公共组件
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── layouts/             # 布局组件
│   │   ├── pages/               # 页面组件
│   │   ├── router/              # 路由 + AuthGuard
│   │   ├── stores/              # Zustand Store
│   │   ├── styles/              # 全局样式 + CSS 变量
│   │   ├── types/               # TypeScript 类型
│   │   └── utils/               # 工具函数
│   ├── nginx.conf               # 生产 Nginx 配置
│   └── vite.config.ts           # Vite 配置
├── docker/                      # Docker 初始化脚本
├── docker-compose.yml           # 本地开发编排
├── docker-compose.prod.yml      # 生产环境编排
├── .env.example                 # 环境变量模板
└── .github/workflows/           # CI/CD (ACR 构建 + ECS 部署)
```

## 🚀 本地开发

### 前置条件

- JDK 21+
- Node.js 22+
- Docker 和 Docker Compose

### 1. 启动基础设施

```bash
docker compose up -d
```

启动 MySQL、Redis、RabbitMQ、MinIO。

### 2. 启动后端

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

后端运行在 `http://localhost:8080`，使用 `application-dev.yml` 配置。

Swagger 文档：`http://localhost:8080/swagger-ui/index.html`

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`，API 请求自动代理到后端。

### 可用脚本

```bash
npm run build     # 生产构建
npm run test      # 运行测试 (Vitest)
npm run lint      # 代码检查 (Oxlint)
npm run format    # 代码格式化 (Prettier)
```

### 中间件访问

| 服务 | 地址 | 账号 / 密码 |
|---|---|---|
| Druid 监控 | `http://localhost:8080/druid/` | admin / druid123456 |
| RabbitMQ 管理 | `http://localhost:15672` | admin / admin123456 |
| MinIO 控制台 | `http://localhost:9001` | minioadmin / minioadmin123 |

## 🐳 Docker 部署

完整栈一键启动：

```bash
docker compose --profile docker up -d
```

生产环境：

```bash
# 复制并填写环境变量
cp .env.example .env

# 启动
docker compose -f docker-compose.prod.yml up -d
```

## 📐 数据库

使用 Flyway 管理数据库版本，迁移脚本位于 `backend/src/main/resources/db/migration/`。

| 版本 | 内容 |
|---|---|
| V1 | 初始表结构（user, project, project_member, task_list, task） |
| V2 | 任务增加优先级字段 |
| V3 | 截止日期、封面颜色、标签系统 |
| V4 | 清单子任务表 |
| V5 | 项目链接字段 |
| V6 | 项目公开/私有标识 |

## 🔐 权限模型

- **认证**：JWT Bearer Token（24 小时有效期）
- **公开项目**：任何人可查看，操作需成员权限
- **私有项目**：仅成员可查看和操作
- **角色**：Owner（删除项目）、Admin（编辑项目）、Member（CRUD 任务）

## 📡 API 概览

| 模块 | 路径前缀 | 说明 |
|---|---|---|
| 认证 | `/api/v1/auth` | 注册、登录、恢复会话 |
| 用户 | `/api/v1/users` | 用户 CRUD |
| 项目 | `/api/v1/projects` | 看板管理 |
| 列表 | `/api/v1/projects/{projectId}/lists` | 列管理 |
| 任务 | `/api/v1/tasks` | 卡片 CRUD、移动、排序 |
| 清单 | `/api/v1/tasks/{taskId}/checklist` | 子任务管理 |
| 文件 | `/api/v1/files` | MinIO 文件上传 |
| 仪表盘 | `/api/v1/dashboard` | 概览统计 |

详见 Swagger 文档 `http://localhost:8080/swagger-ui/index.html`。

## 🤝 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/xxx`)
3. 提交改动 (`git commit -m 'feat: add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 发起 Pull Request

## 📄 License

MIT
