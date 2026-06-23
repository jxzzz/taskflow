-- 创建数据库
CREATE DATABASE IF NOT EXISTS `taskflow_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `taskflow_db`;

-- 1. 用户表
CREATE TABLE `user` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL COMMENT '用户名',
    `password` varchar(100) NOT NULL COMMENT '密码(加密后)',
    `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户表';

-- 2. 项目表
CREATE TABLE `project` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL COMMENT '项目名称',
    `description` varchar(255) DEFAULT NULL COMMENT '项目描述',
    `owner_id` bigint NOT NULL COMMENT '创建者(拥有者)ID',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '项目表';

-- 3. 项目成员表 (多对多关联关系，权限控制的基础)
CREATE TABLE `project_member` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `project_id` bigint NOT NULL COMMENT '项目ID',
    `user_id` bigint NOT NULL COMMENT '用户ID',
    `role` tinyint NOT NULL DEFAULT '0' COMMENT '角色: 0-普通成员, 1-管理员',
    `join_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_project_user` (`project_id`, `user_id`) -- 防止同一用户重复加入同一项目
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '项目成员关联表';

-- 4. 任务列表表 (例如: 待办、进行中、已完成)
CREATE TABLE `task_list` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `project_id` bigint NOT NULL COMMENT '所属项目ID',
    `name` varchar(50) NOT NULL COMMENT '列表名称',
    `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序号(前端拖拽排序用)',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '任务列表(看板列)表';

-- 5. 任务卡片表 (核心业务表)
CREATE TABLE `task` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `list_id` bigint NOT NULL COMMENT '所属任务列表ID',
    `title` varchar(255) NOT NULL COMMENT '任务标题',
    `content` text COMMENT '任务详细描述(Markdown格式)',
    `assignee_id` bigint DEFAULT NULL COMMENT '负责人ID',
    `sort_order` int NOT NULL DEFAULT '0' COMMENT '列表内的排序号(前端拖拽用)',
    `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除标记: 0-未删除, 1-已删除',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '任务卡片表';