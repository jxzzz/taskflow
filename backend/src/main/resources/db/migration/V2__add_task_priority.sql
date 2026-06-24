-- V2: 任务新增优先级字段

ALTER TABLE `task` ADD COLUMN `priority` tinyint NOT NULL DEFAULT '0' COMMENT '优先级: 0-普通, 1-紧急, 2-非常紧急' AFTER `title`;
