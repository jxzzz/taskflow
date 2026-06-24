package com.taskflow.controller;

import com.taskflow.dto.ApiResponse;
import com.taskflow.dto.ReorderItem;
import com.taskflow.dto.TaskListCreateRequest;
import com.taskflow.dto.TaskListSummary;
import com.taskflow.service.TaskListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "任务列表接口", description = "看板列表(列) CRUD")
@RestController
@RequestMapping("/api/v1/projects/{projectId}/lists")
@RequiredArgsConstructor
public class TaskListController {

    private final TaskListService taskListService;

    @Operation(summary = "创建列表")
    @PostMapping
    public ApiResponse<TaskListSummary> create(
            @Parameter(description = "看板ID") @PathVariable Long projectId,
            @Valid @RequestBody TaskListCreateRequest request) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success("创建成功",
                taskListService.create(projectId, request, currentUserId));
    }

    @Operation(summary = "获取看板下所有列表（含卡片）")
    @GetMapping
    public ApiResponse<List<TaskListSummary>> list(
            @Parameter(description = "看板ID") @PathVariable Long projectId) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success(
                taskListService.listByProject(projectId, currentUserId));
    }

    @Operation(summary = "更新列表")
    @PutMapping("/{id}")
    public ApiResponse<TaskListSummary> update(
            @Parameter(description = "看板ID") @PathVariable Long projectId,
            @Parameter(description = "列表ID") @PathVariable Long id,
            @RequestBody TaskListCreateRequest request) {
        Long currentUserId = getCurrentUserId();
        return ApiResponse.success("更新成功",
                taskListService.update(projectId, id, request.getName(), currentUserId));
    }

    @Operation(summary = "删除列表")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @Parameter(description = "看板ID") @PathVariable Long projectId,
            @Parameter(description = "列表ID") @PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        taskListService.delete(projectId, id, currentUserId);
        return ApiResponse.success("删除成功", null);
    }

    @Operation(summary = "列表排序")
    @PutMapping("/reorder")
    public ApiResponse<Void> reorder(
            @Parameter(description = "看板ID") @PathVariable Long projectId,
            @Valid @RequestBody List<ReorderItem> items) {
        Long currentUserId = getCurrentUserId();
        taskListService.reorder(projectId, items, currentUserId);
        return ApiResponse.success("排序成功", null);
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
