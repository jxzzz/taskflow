package com.taskflow.controller;

import com.taskflow.dto.ApiResponse;
import com.taskflow.dto.DashboardResponse;
import com.taskflow.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "工作台接口", description = "工作台概览")
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "获取工作台概览")
    @GetMapping
    public ApiResponse<DashboardResponse> overview() {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success(dashboardService.getOverview(currentUserId));
    }

    /**
     * 从 JWT SecurityContext 获取当前登录用户 ID
     */
    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
