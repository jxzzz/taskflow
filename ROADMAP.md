# TaskFlow 全栈开发路线

## 项目结构

```
TaskFlow/
├── docker-compose.yml              # MySQL + Redis + RabbitMQ + MinIO + Backend
├── backend/                        # Spring Boot 3.x 项目
│   ├── pom.xml                     # Maven 配置
│   ├── mvnw / mvnw.cmd             # Maven Wrapper（无需装 Maven）
│   ├── Dockerfile                  # 多阶段构建
│   └── src/main/java/com/taskflow/
│       ├── TaskFlowApplication.java
│       ├── config/                 # 6 个配置类
│       │   ├── MyBatisPlusConfig.java
│       │   ├── SecurityConfig.java
│       │   ├── RedisConfig.java
│       │   ├── RabbitMQConfig.java
│       │   ├── MinioConfig.java
│       │   └── WebMvcConfig.java
│       ├── controller/             # 3 个控制器
│       │   ├── AuthController.java     # 注册、登录
│       │   ├── UserController.java     # 用户 CRUD
│       │   └── FileController.java     # 文件上传
│       ├── service/                # 业务层
│       │   ├── UserService.java
│       │   └── impl/UserServiceImpl.java
│       ├── mapper/                 # MyBatis-Plus 数据访问
│       │   ├── UserMapper.java
│       │   ├── ProjectMapper.java
│       │   ├── ProjectMemberMapper.java
│       │   ├── TaskListMapper.java
│       │   └── TaskMapper.java
│       ├── entity/                 # 5 个实体类
│       │   ├── User.java
│       │   ├── Project.java
│       │   ├── ProjectMember.java
│       │   ├── TaskList.java
│       │   └── Task.java
│       ├── dto/                    # 数据传输对象
│       │   ├── ApiResponse.java        # 统一响应包装
│       │   ├── UserRegisterRequest.java
│       │   ├── UserLoginRequest.java
│       │   ├── UserUpdateRequest.java
│       │   ├── UserResponse.java
│       │   └── LoginResponse.java
│       ├── enums/                  # 枚举
│       │   └── ProjectMemberRole.java
│       ├── exception/              # 异常处理
│       │   ├── BusinessException.java
│       │   └── GlobalExceptionHandler.java
│       ├── security/               # 安全相关
│       │   └── JwtAuthenticationFilter.java
│       └── utils/                  # 工具类
│           ├── JwtUtils.java
│           └── MinioUtils.java
├── docker/mysql/init/init.sql     # 数据库初始化脚本
└── frontend/                       # 前端占位（二期）
```

---

## 第一步：数据库搭建 ✅

- MySQL 8.0 Docker 容器启动
- 数据库 `taskflow_db` 创建
- 5 张基础表：`user`、`project`、`project_member`、`task_list`、`task`

## 第二步：后端项目搭建 ✅

- **框架**: Spring Boot 3.4.x + Java 21
- **ORM**: MyBatis-Plus 3.5.5
- **认证**: Spring Security + JWT（无状态）
- **数据库**: MySQL 8.0（Docker）
- **缓存**: Redis 7（Docker）
- **消息队列**: RabbitMQ 4.0（Docker）
- **对象存储**: MinIO（Docker）
- **API 文档**: Knife4j（Swagger 增强版）
- **工具**: Lombok + Hutool
- **构建**: Maven + Maven Wrapper

### 已实现接口

| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| POST | `/api/v1/auth/register` | 用户注册 | 无需 |
| POST | `/api/v1/auth/login` | 用户登录，返回 JWT | 无需 |
| GET | `/api/v1/users` | 用户列表（分页） | Bearer Token |
| GET | `/api/v1/users/{id}` | 用户详情 | Bearer Token |
| PUT | `/api/v1/users/{id}` | 更新用户 | Bearer Token |
| DELETE | `/api/v1/users/{id}` | 删除用户 | Bearer Token |
| POST | `/api/v1/files/upload` | 文件上传（MinIO） | Bearer Token |

### 运行中的服务

| 服务 | 端口 | 说明 |
|---|---|---|
| taskflow-backend | 8080 | Spring Boot 应用 |
| taskflow-mysql | 3306 | MySQL 数据库 |
| taskflow-redis | 6379 | Redis 缓存 |
| taskflow-rabbitmq | 5672 / 15672 | 消息队列 / 管理后台 |
| taskflow-minio | 9000 / 9001 | 对象存储 / 管理后台 |

### 管理地址

- **API 文档**: http://localhost:8080/doc.html
- **RabbitMQ 控制台**: http://localhost:15672（admin / admin123456）
- **MinIO 控制台**: http://localhost:9001（minioadmin / minioadmin123）

### 常用命令

```bash
# 启动全部服务
docker compose up -d

# 停止全部服务
docker compose down

# 查看日志
docker compose logs -f backend

# 重启后端（改代码后）
docker compose up -d --build backend

# 在本地 IDE 开发（需要 dev profile）
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## 第三步：待办

- [ ] 继续编写 Project / Task 相关业务接口
- [ ] 前端项目搭建（React / Vue / Next.js）

## 第四步：微服务拆分（二期）

```
Gateway (Spring Cloud Gateway)
  ├── auth-service
  ├── user-service
  ├── project-service
  └── task-service

Nacos + OpenFeign + Spring Cloud LoadBalancer
```

## 第五步：部署上线

- [ ] 服务器选型
- [ ] CI/CD 流水线
- [ ] 域名 + HTTPS
