package com.taskflow.service;

import com.taskflow.dto.DashboardResponse;

public interface DashboardService {

    /**
     * 获取当前用户的工作台概览
     */
    DashboardResponse getOverview(Long currentUserId);
}
