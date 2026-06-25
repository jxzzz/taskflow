package com.taskflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.taskflow.dto.ActivityLogResponse;
import com.taskflow.dto.ApiResponse;
import com.taskflow.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "活动日志接口", description = "操作活动日志查询")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityLogService activityLogService;

    @Operation(summary = "获取当前用户的活动日志列表")
    @GetMapping("/activities")
    public ApiResponse<IPage<ActivityLogResponse>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success(activityLogService.listByUser(currentUserId, page, size));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
