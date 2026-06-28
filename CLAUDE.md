# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Spring Boot / Java 21)

```bash
# Start locally (requires Docker infrastructure running)
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Compile only
cd backend && ./mvnw compile

# Run all tests
cd backend && ./mvnw test

# Run a single test class
cd backend && ./mvnw test -Dtest=TaskServiceImplTest
```

### Frontend (React 19 / TypeScript / Vite 8)

```bash
cd frontend

# Dev server (port 5173, proxies /api → localhost:8080)
npm run dev

# Production build (tsc + vite build)
npm run build

# Type check only (no emit)
npm run type-check       # tsc --noEmit

# Lint (Oxlint)
npm run lint             # oxlint
npm run lint:fix         # oxlint --fix

# Format (Prettier)
npm run format           # prettier --write 'src/**/*.{ts,tsx,css,json}'
npm run format:check     # prettier --check

# Test (Vitest)
npm run test             # vitest
npm run test:coverage    # vitest --coverage
```

### Infrastructure (Docker Compose)

```bash
# Start infrastructure only (MySQL, Redis, RabbitMQ, MinIO)
docker compose up -d

# Start full stack in Docker
docker compose --profile docker up -d

# Production
docker compose -f docker-compose.prod.yml up -d
```

## Architecture

### Frontend

**State management split**: TanStack React Query for server state (all data fetching/caching/mutations), Zustand for client-only state (auth, sidebar, theme, language). Query cache keys use simple string arrays like `['projects']`, `['tasks', id]`. Most mutations invalidate `['projects']` to refetch kanban data.

**API layer** (`src/api/`): Axios instance at `client.ts` auto-attaches JWT Bearer token, unwraps `ApiResponse<T>.data` on success, redirects to `/auth/login` on 401. API functions return typed promises — the response interceptor strips the envelope so callers receive the data directly.

**Auth flow**: JWT token stored in localStorage. On page refresh, `useAuthInit` checks for a stored token and calls `GET /auth/me` to recover the user object. `AuthGuard` shows a spinner until initialization completes, then redirects unauthenticated users to login with a `returnUrl` param.

**Routing**: Lazy-loaded pages via `React.lazy`, wrapped in `PageLoading` suspense. `MainLayout` (sidebar + header) wraps all authenticated routes inside `AuthGuard`. Route paths use the `ROUTES` constant object.

**Kanban drag-and-drop**: Uses `@hello-pangea/dnd` (not `@dnd-kit`). Drag state is deferred to `onDragEnd` — no optimistic updates during drag. See `ProjectDetailPage.tsx`, `useKanbanDrag.ts`.

**Kanban keyboard shortcuts**: Defined in `useKanbanShortcuts.ts` — arrow keys navigate cards, Enter opens detail, N creates a new card, Delete removes.

**Theme**: Custom design tokens in `App.tsx` (`buildThemeTokens()`) overriding Ant Design's token system. Four CSS-variable-driven soft color palettes are defined in `src/styles/variables.css`.

### Backend

**Layered architecture**: Controller → Service interface → Service implementation → Mapper (MyBatis-Plus). Each layer follows this pattern strictly. DTOs use Lombok `@Builder` and are manually mapped in service implementations (no MapStruct).

**Authentication**: `JwtAuthenticationFilter` extends `OncePerRequestFilter`, extracts Bearer token, validates it, and sets `SecurityContextHolder` with the user ID as principal. `SecurityConfig` is stateless (no sessions), CSRF disabled, `/api/v1/auth/**` and Swagger/Druid paths are public.

**Authorization**: Role-based at project level via `ProjectMember` table (Owner/Admin/Member). Public projects (`is_public=true`) allow read-only access; writes still require membership. Permission checks are manual in service methods (e.g., `checkMemberByProjectId`), not annotation-driven.

**API response envelope**: All responses go through `ApiResponse<T>` with `code` (200 = success), `message`, and `data`. The `GlobalExceptionHandler` translates `BusinessException`, validation errors, and access denied into this envelope. Business errors use distinct HTTP-like codes (400, 403, 404).

**Database**: Flyway manages migrations in `db/migration/` (V1–V8). MyBatis-Plus provides ActiveRecord-style CRUD via `BaseMapper<T>`. Soft deletes use `@TableLogic` on `is_deleted` fields, though some operations bypass it with raw `.setSql("is_deleted = 1")`.

**File uploads**: MinIO object storage via `MinioUtils`. Files are uploaded through presigned URLs or direct multipart upload.

**Messaging**: RabbitMQ for async activity logging. `TaskEventListener` consumes task events while `MessageProducer` publishes. This decouples activity log writes from the request-response cycle.

### CI/CD

**Build & Push** (`.github/workflows/build-push.yml`): Triggers on push to main, conditionally builds backend/frontend Docker images based on changed paths, pushes to Alibaba Cloud ACR.

**Deploy** (`.github/workflows/deploy.yml`): Runs after Build & Push completes, SSHes to server, pulls images, runs `docker compose -f docker-compose.prod.yml up -d --no-deps`.

## Key Conventions

- **Frontend types** mirror backend DTOs exactly — TypeScript interfaces include `@/types/` comments matching the Java class name (e.g., `// 匹配 TaskMoveRequest.java`).
- **Hooks** in `src/hooks/` are thin wrappers around TanStack Query — each hook exports one query or mutation function. Mutations show error toasts via `App.useApp().message`.
- **Stores** are plain Zustand stores, no middleware. Selectors use the `(s) => s.field` pattern inline at call sites.
- **Backend services** are split into interface + impl — the interface defines the contract, the `impl` package holds the Spring `@Service` bean. Controllers only depend on the interface.
- **MyBatis-Plus** uses `LambdaQueryWrapper` / `LambdaUpdateWrapper` exclusively (no string-based column names), with method references for type-safe queries.
- **No test files exist yet** in either frontend or backend — `vitest` and JUnit are configured but the test suites are empty.
