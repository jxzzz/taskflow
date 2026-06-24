-- V4: 任务清单（子任务/检查项）
CREATE TABLE `checklist_item` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `task_id` bigint NOT NULL COMMENT '所属任务卡片ID',
    `title` varchar(255) NOT NULL COMMENT '检查项标题',
    `completed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否完成: 0-未完成, 1-已完成',
    `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序号',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务清单检查项表';
