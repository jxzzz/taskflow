package com.taskflow.controller;

import com.taskflow.dto.ApiResponse;
import com.taskflow.dto.ChecklistItemResponse;
import com.taskflow.service.ChecklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "任务清单接口", description = "检查项 CRUD + 完成切换")
@RestController
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;

    @Operation(summary = "获取任务的所有检查项")
    @GetMapping("/api/v1/tasks/{taskId}/checklist")
    public ApiResponse<List<ChecklistItemResponse>> list(
            @Parameter(description = "任务ID") @PathVariable Long taskId) {
        return ApiResponse.success(checklistService.listByTask(taskId, getCurrentUserId()));
    }

    @Operation(summary = "添加检查项")
    @PostMapping("/api/v1/tasks/{taskId}/checklist")
    public ApiResponse<ChecklistItemResponse> create(
            @Parameter(description = "任务ID") @PathVariable Long taskId,
            @Valid @RequestBody CreateChecklistItemRequest request) {
        return ApiResponse.success("添加成功",
                checklistService.create(taskId, request.getTitle(), getCurrentUserId()));
    }

    @Operation(summary = "切换检查项完成状态")
    @PutMapping("/api/v1/checklist/{id}/toggle")
    public ApiResponse<ChecklistItemResponse> toggle(
            @Parameter(description = "检查项ID") @PathVariable Long id) {
        return ApiResponse.success(checklistService.toggle(id, getCurrentUserId()));
    }

    @Operation(summary = "删除检查项")
    @DeleteMapping("/api/v1/checklist/{id}")
    public ApiResponse<Void> delete(
            @Parameter(description = "检查项ID") @PathVariable Long id) {
        checklistService.delete(id, getCurrentUserId());
        return ApiResponse.success("删除成功", null);
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Data
    static class CreateChecklistItemRequest {
        @NotBlank(message = "检查项标题不能为空")
        private String title;
    }
}
