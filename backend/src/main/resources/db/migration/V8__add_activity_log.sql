CREATE TABLE `activity_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL COMMENT '所属项目ID',
    `user_id` BIGINT NOT NULL COMMENT '操作人用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '操作人用户名',
    `action_type` VARCHAR(50) NOT NULL COMMENT '操作类型: PROJECT_CREATE 等',
    `entity_type` VARCHAR(50) NOT NULL COMMENT '实体类型: PROJECT / TASK / TASK_LIST / MEMBER / CHECKLIST',
    `entity_id` BIGINT DEFAULT NULL COMMENT '实体ID',
    `entity_name` VARCHAR(255) DEFAULT NULL COMMENT '实体名称',
    `description` VARCHAR(500) NOT NULL COMMENT '中文描述',
    `old_value` VARCHAR(255) DEFAULT NULL COMMENT '变更前的值',
    `new_value` VARCHAR(255) DEFAULT NULL COMMENT '变更后的值',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (`id`),
    INDEX `idx_project_id` (`project_id`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作活动日志表';
