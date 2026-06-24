# TaskFlow 全栈开发路线

## 项目结构

```
TaskFlow/
├── docker-compose.yml                 # 本地开发：Docker Hub + 硬编码密码
├── docker-compose.prod.yml            # 生产（国际）：Docker Hub + .env
├── docker-compose.al.prod.yml         # 生产（阿里云）：ACR VPC + .env
├── .env.example                       # 生产环境变量模板
├── .github/workflows/
│   ├── build-push.yml                 # 自动构建 + 推送 ACR
│   └── deploy.yml                     # 自动部署到服务器
├── docker/mysql/init/init.sql         # 仅建库（表结构由 Flyway 管理）
└── backend/                           # Spring Boot 3.4.6 + Java 21
    ├── Dockerfile                     # 多阶段构建
    ├── pom.xml
    └── src/main/
        ├── java/com/taskflow/
        │   ├── config/                # 6 个配置类
        │   │   ├── SecurityConfig.java      # Spring Security + JWT
        │   │   ├── MyBatisPlusConfig.java   # 分页插件
        │   │   ├── RedisConfig.java         # 序列化
        │   │   ├── RabbitMQConfig.java      # 死信 + 重试
        │   │   ├── MinioConfig.java         # 对象存储
        │   │   └── WebMvcConfig.java        # CORS
        │   ├── controller/
        │   ├── service/ + impl/
        │   ├── mapper/
        │   ├── entity/
        │   ├── dto/
        │   ├── enums/
        │   ├── exception/
        │   ├── listener/              # MQ 消费者
        │   ├── security/
        │   └── utils/
        └── resources/
            ├── application.yml        # 默认配置（Docker 环境）
            ├── application-dev.yml    # 本地 IDE 开发
            └── db/migration/          # Flyway 迁移脚本
                ├── V1__init_schema.sql
                └── V2__add_task_priority.sql
```

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Spring Boot 3.4.6 + Java 21 |
| ORM | MyBatis-Plus 3.5.5 |
| 连接池 | Druid 1.2.24（监控 + SQL 防护） |
| 数据库迁移 | Flyway |
| 认证 | Spring Security + JWT（无状态） |
| 缓存 | Redis 7（Lettuce 客户端） |
| 消息队列 | RabbitMQ 4.0（死信 + 重试 + 手动确认） |
| 对象存储 | MinIO |
| API 文档 | SpringDoc 2.7.0（Swagger UI） |
| 构建 | Maven + Maven Wrapper |
| CI/CD | GitHub Actions → 阿里云 ACR → ECS |
| 工具 | Lombok + Hutool |

---

## 第一步：数据库搭建 ✅

- MySQL 8.0 Docker 容器启动
- 数据库 `taskflow_db`
- 5 张表：`user`、`project`、`project_member`、`task_list`、`task`
- Flyway 版本化管理表结构变更

## 第二步：后端项目搭建 ✅

应用层、基础设施层全部就绪，6 个配置类覆盖核心中间件。

### 已实现接口

| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| POST | `/api/v1/auth/register` | 用户注册 | 无需 |
| POST | `/api/v1/auth/login` | 用户登录，返回 JWT | 无需 |
| GET | `/api/v1/users` | 用户列表（分页）| Bearer Token |
| GET | `/api/v1/users/{id}` | 用户详情 | Bearer Token |
| PUT | `/api/v1/users/{id}` | 更新用户 | Bearer Token |
| DELETE | `/api/v1/users/{id}` | 删除用户 | Bearer Token |
| POST | `/api/v1/files/upload` | 文件上传（MinIO）| Bearer Token |

### 服务端口

| 服务 | 端口 | 管理地址 |
|---|---|---|
| taskflow-backend | 8080 | http://localhost:8080/swagger-ui/index.html |
| taskflow-mysql | 3306 | - |
| taskflow-redis | 6379 | - |
| taskflow-rabbitmq | 5672 | http://localhost:15672（admin / admin123456） |
| taskflow-minio | 9000 | http://localhost:9001（minioadmin / minioadmin123） |
| Druid 监控 | 8080 | http://localhost:8080/druid/（admin / druid123456） |

---

## 第三步：CI/CD 部署流水线 ✅

### 镜像流程

```
本地 → git push → GitHub
                     │
                     ▼
              Build & Push（自动）
                │
                ├── checkout 代码
                ├── docker build（./backend/Dockerfile）
                ├── docker push → 阿里云 ACR 公网
                │
                ▼
              Deploy（自动，build 成功后触发）
                │
                ├── SSH 到 ECS
                ├── docker pull（ACR VPC 内网）
                └── docker compose -f docker-compose.al.prod.yml up -d
```

### GitHub Actions 配置

| Secret | 说明 |
|---|---|
| `ACR_USERNAME` | 阿里云 ACR 登录用户名 |
| `ACR_PASSWORD` | 阿里云 ACR 登录密码 |
| `SERVER_HOST` | ECS 公网 IP |
| `SERVER_USER` | SSH 用户名（root） |
| `SERVER_SSH_KEY` | SSH 私钥完整内容（含头尾） |

### 服务器部署步骤

```bash
# === 首次部署 ===

# 1. 准备工作目录
mkdir -p ~/code/taskflow/docker/mysql/init

# 2. 上传部署文件
scp docker-compose.al.prod.yml root@<IP>:~/code/taskflow/
scp .env.example root@<IP>:~/code/taskflow/.env
scp docker/mysql/init/init.sql root@<IP>:~/code/taskflow/docker/mysql/init/

# 3. 编辑密码
vim ~/code/taskflow/.env

# 4. 启动
cd ~/code/taskflow
docker compose -f docker-compose.al.prod.yml up -d

# 5. 验证
curl http://localhost:8080/swagger-ui/index.html
```

```bash
# === 后续自动更新（每次 push 后自动执行，无需手动操作）===

cd ~/code/taskflow
docker pull crpi-ytlg6tfv9wxn5mfu-vpc.cn-shanghai.personal.cr.aliyuncs.com/mxy-x/taskflow-backend:latest
docker compose -f docker-compose.al.prod.yml up -d --no-deps backend
docker image prune -f
```

### 常用命令

```bash
# 本地开发启动
docker compose up -d
# 重新构建后端
docker compose up -d --build backend
# 查看日志
docker compose logs -f backend
# 停止
docker compose down

# IDE 开发（dev profile，连 localhost）
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 数据库变更：新建 Flyway 迁移脚本
# backend/src/main/resources/db/migration/V<N>__<描述>.sql
# 提交后部署时自动执行
```

---

## 第四步：待办

- [ ] 继续编写 Project / Task 相关业务接口
- [ ] 前端项目搭建（React / Vue / Next.js）

## 第五步：微服务拆分（二期）

```
Gateway (Spring Cloud Gateway)
  ├── auth-service
  ├── user-service
  ├── project-service
  └── task-service

Nacos + OpenFeign + Spring Cloud LoadBalancer
```
