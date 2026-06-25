-- V7: 为 project 表添加项目状态、开始日期和截止日期
ALTER TABLE project
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '项目状态: active=进行中, completed=已完成, archived=已归档' AFTER is_public,
    ADD COLUMN start_date DATE NULL COMMENT '项目开始日期' AFTER status,
    ADD COLUMN end_date DATE NULL COMMENT '项目截止日期' AFTER start_date;
