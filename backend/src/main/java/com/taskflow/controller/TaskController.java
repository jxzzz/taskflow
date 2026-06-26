package com.taskflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.taskflow.dto.ApiResponse;
import com.taskflow.dto.ReorderItem;
import com.taskflow.dto.TaskCreateRequest;
import com.taskflow.dto.TaskMoveRequest;
import com.taskflow.dto.TaskResponse;
import com.taskflow.dto.TaskUpdateRequest;
import com.taskflow.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "任务卡片接口", description = "任务卡片 CRUD + 移动 + 排序")
@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "创建卡片")
    @PostMapping("/api/v1/lists/{listId}/tasks")
    public ApiResponse<TaskResponse> create(
            @Parameter(description = "列表ID") @PathVariable Long listId,
            @Valid @RequestBody TaskCreateRequest request) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success("创建成功",
                taskService.create(listId, request, currentUserId));
    }

    @Operation(summary = "获取列表下的卡片")
    @GetMapping("/api/v1/lists/{listId}/tasks")
    public ApiResponse<IPage<TaskResponse>> listByList(
            @Parameter(description = "列表ID") @PathVariable Long listId,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success(taskService.listByList(listId, page, size, currentUserId));
    }

    @Operation(summary = "获取卡片详情")
    @GetMapping("/api/v1/tasks/{id}")
    public ApiResponse<TaskResponse> getById(
            @Parameter(description = "卡片ID") @PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success(taskService.getById(id, currentUserId));
    }

    @Operation(summary = "更新卡片")
    @PutMapping("/api/v1/tasks/{id}")
    public ApiResponse<TaskResponse> update(
            @Parameter(description = "卡片ID") @PathVariable Long id,
            @Valid @RequestBody TaskUpdateRequest request) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success("更新成功",
                taskService.update(id, request, currentUserId));
    }

    @Operation(summary = "删除卡片")
    @DeleteMapping("/api/v1/tasks/{id}")
    public ApiResponse<Void> delete(
            @Parameter(description = "卡片ID") @PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        taskService.delete(id, currentUserId);
        return ApiResponse.success("删除成功", null);
    }

    @Operation(summary = "移动卡片到另一个列表")
    @PutMapping("/api/v1/tasks/{id}/move")
    public ApiResponse<TaskResponse> move(
            @Parameter(description = "卡片ID") @PathVariable Long id,
            @Valid @RequestBody TaskMoveRequest request) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success("移动成功",
                taskService.move(id, request, currentUserId));
    }

    @Operation(summary = "同列表内卡片排序")
    @PutMapping("/api/v1/projects/{projectId}/lists/{listId}/tasks/reorder")
    public ApiResponse<Void> reorder(
            @Parameter(description = "项目ID") @PathVariable Long projectId,
            @Parameter(description = "列表ID") @PathVariable Long listId,
            @Valid @RequestBody List<ReorderItem> items) {

        Long currentUserId = getCurrentUserId();
        taskService.reorder(projectId, listId, items, currentUserId);
        return ApiResponse.success("排序成功", null);
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
