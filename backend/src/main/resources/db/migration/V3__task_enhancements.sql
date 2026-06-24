-- V3: 任务增强 + 标签系统
-- 扩展 task 表支持截止日期和封面，创建标签相关表

-- 1. task 表增加截止日期
ALTER TABLE `task`
    ADD COLUMN `due_date` datetime DEFAULT NULL COMMENT '截止日期' AFTER `priority`;

-- 2. task 表增加封面颜色（卡片背景色）
ALTER TABLE `task`
    ADD COLUMN `cover_color` varchar(7) DEFAULT NULL COMMENT '封面颜色(hex)' AFTER `due_date`;

-- 3. task 表增加封面图片 URL
ALTER TABLE `task`
    ADD COLUMN `cover_image` varchar(255) DEFAULT NULL COMMENT '封面图片URL' AFTER `cover_color`;

-- 4. 标签表（可跨卡片复用的彩色标签）
CREATE TABLE `label` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `project_id` bigint NOT NULL COMMENT '所属项目ID',
    `name` varchar(30) NOT NULL COMMENT '标签名称',
    `color` varchar(7) NOT NULL COMMENT '标签颜色(hex, 如 #FF6B6B)',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表';

-- 5. 卡片-标签关联表（多对多）
CREATE TABLE `task_label` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `task_id` bigint NOT NULL COMMENT '任务ID',
    `label_id` bigint NOT NULL COMMENT '标签ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_task_label` (`task_id`, `label_id`),
    KEY `idx_label_id` (`label_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='卡片标签关联表';
