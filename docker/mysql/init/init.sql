-- Docker 初始化脚本：仅创建数据库
-- 表结构由 Flyway 管理（resources/db/migration/）

CREATE DATABASE IF NOT EXISTS `taskflow_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
