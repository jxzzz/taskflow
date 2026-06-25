package com.taskflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.taskflow.dto.ActivityLogResponse;
import com.taskflow.dto.OperationLogEntry;

public interface ActivityLogService {

    /**
     * 持久化一条操作日志
     */
    void create(OperationLogEntry entry);

    /**
     * 查询用户所属项目的活动列表（分页）
     */
    IPage<ActivityLogResponse> listByUser(Long userId, int page, int size);
}
